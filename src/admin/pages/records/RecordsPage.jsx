import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { downloadDataset, fetchList } from "../../api/adminApi.js";
import FilterBar from "../../components/FilterBar.jsx";
import Pagination from "../../components/Pagination.jsx";
import RecordTable from "../../components/RecordTable.jsx";
import TopStats from "./TopStats.jsx";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../components/StateBlock.jsx";
import useAdmin from "../../hooks/useAdmin.js";
import useDebounced from "../../hooks/useDebounced.js";
import useFetch from "../../hooks/useFetch.js";
import locations from "../../../env2/data/nigeriaLocations.json";
import PageHeader from "../PageHeader.jsx";
import { RowDialogs } from "./dialogs.jsx";
import { buildActions } from "./rowActions.js";

const PAGE_SIZE = 25;

function resolveFilters(section) {
  return section.filters.map((filter) =>
    filter.optionsFrom === "states" ? { ...filter, options: locations.states } : filter
  );
}

export default function RecordsPage({ section, footer }) {
  const { me } = useAdmin();
  const { toast } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const [searchText, setSearchText] = useState(params.get("q") || "");
  const debounced = useDebounced(searchText);
  const [dialog, setDialog] = useState(null);
  const [exporting, setExporting] = useState(false);
  const filters = useMemo(() => resolveFilters(section), [section]);
  const permissions = me.permissions;

  const page = Math.max(1, Number(params.get("page")) || 1);
  const query = params.get("q") || "";
  const filterValues = useMemo(
    () => Object.fromEntries(filters.map((filter) => [filter.name, params.get(filter.name) || ""])),
    [filters, params]
  );

  const update = useCallback(
    (changes) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          Object.entries(changes).forEach(([key, value]) => {
            if (value) next.set(key, value);
            else next.delete(key);
          });
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  useEffect(() => {
    if (debounced !== query) update({ q: debounced, page: "" });
  }, [debounced, query, update]);

  const loader = useCallback(
    () => fetchList(section.api, { q: query, page, page_size: PAGE_SIZE, ...filterValues }),
    [section.api, query, page, filterValues]
  );
  const { status, data, error, reload } = useFetch(loader);

  const open = (type, row) => setDialog({ type, row });
  const done = (message, tone = "success") => {
    toast.show(message, tone);
    reload();
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      await downloadDataset(section.dataset, true);
      toast.show("Export downloaded with masked contact details.");
    } catch (failure) {
      toast.show(failure.message, "error");
    } finally {
      setExporting(false);
    }
  };

  const hasRows = data && data.items.length > 0;
  const showEmptyConfig = section.emptyTitle && status === "ready" && !hasRows;
  const canInvite = section.key === "admins";

  return (
    <>
      <PageHeader label={section.label} sub={section.sub}>
        {section.dataset && (
          <button
            type="button"
            className="btn"
            onClick={exportCsv}
            disabled={!permissions.export || exporting}
            title={permissions.export ? undefined : "Not permitted for your role"}
          >
            Export CSV
          </button>
        )}
        {canInvite && (
          <button
            type="button"
            className="btn pr"
            onClick={() => open("invite", null)}
            disabled={!permissions.perm}
            title={permissions.perm ? undefined : "Not permitted for your role"}
          >
            Invite admin
          </button>
        )}
      </PageHeader>

      <TopStats sectionKey={section.key} total={data ? data.total : 0} />
      {section.columns.length > 0 && (
        <FilterBar
          search={searchText}
          onSearch={setSearchText}
          filters={filters}
          values={filterValues}
          onFilter={(name, value) => update({ [name]: value, page: "" })}
          placeholder={`Search ${section.label.toLowerCase()}…`}
        />
      )}

      {status === "loading" && <LoadingBlock />}
      {status === "error" && <ErrorBlock message={error} onRetry={reload} />}
      {showEmptyConfig && <EmptyBlock title={section.emptyTitle} text={section.emptyText} />}
      {status === "ready" && !section.emptyTitle && !hasRows && (
        <EmptyBlock
          title="No results"
          text="Try changing your search or filters."
          action={
            <button
              type="button"
              className="btn"
              onClick={() => {
                setSearchText("");
                setParams({}, { replace: true });
              }}
            >
              Clear filters
            </button>
          }
        />
      )}
      {hasRows && (
        <>
          <RecordTable
            columns={section.columns}
            rows={data.items}
            onRowClick={(row) => open("view", row)}
            actions={section.actions.length ? (row) => buildActions(section, row, permissions, open) : null}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onChange={(next) => update({ page: next > 1 ? String(next) : "" })} />
        </>
      )}

      {footer}

      <RowDialogs dialog={dialog} section={section} onClose={() => setDialog(null)} onDone={done} />
    </>
  );
}
