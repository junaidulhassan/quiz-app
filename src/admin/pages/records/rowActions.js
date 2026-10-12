export function buildActions(section, row, permissions, open) {
  const can = (key) => Boolean(permissions[key]);
  const catalog = {
    view: () => ({ label: "View", onClick: () => open("view", row) }),
    edit: () => ({ label: "Edit", onClick: () => open("edit", row), disabled: !can("edit") }),
    toggle: () => {
      const suspended = row.status === "Suspended";
      return {
        label: suspended ? "Activate" : "Suspend",
        onClick: () => open(suspended ? "activate" : "suspend", row),
        disabled: !can("edit"),
        danger: !suspended,
      };
    },
    delete: () => ({ label: "Delete", onClick: () => open("delete", row), disabled: !can("del"), danger: true }),
    verify: () => ({ label: "Verification", onClick: () => open("verify", row), disabled: !can("edit") }),
    flag: () => {
      const flagged = row.status === "Flagged";
      return { label: flagged ? "Unflag" : "Flag", onClick: () => open(flagged ? "unflag" : "flag", row), disabled: !can("edit") };
    },
    role: () => ({ label: "Change role", onClick: () => open("role", row), disabled: !can("perm") }),
    deactivate: () => {
      const inactive = row.status === "Deactivated";
      return {
        label: inactive ? "Reactivate" : "Deactivate",
        onClick: () => open(inactive ? "reactivate" : "deactivate", row),
        disabled: !can("perm"),
        danger: !inactive,
      };
    },
  };
  return section.actions.map((name) => catalog[name]());
}
