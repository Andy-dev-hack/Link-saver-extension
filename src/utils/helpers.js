export const TRUNCATE_LENGTH = 45;
export const TRUNCATE_LENGTH_LONG = 70;
export const STORAGE_KEY = "myLeadsByFolder";

export function truncateName(name, maxLength = TRUNCATE_LENGTH) {
  if (!name) return "";
  if (name.length > maxLength) {
    return name.substring(0, maxLength) + "...";
  }
  return name;
}

export const migrateData = (data) => {
  // If data is array (old format), convert to object
  if (Array.isArray(data)) {
    return {
      "My Leads": data.map((lead) => ({
        ...lead,
        id: lead.id || crypto.randomUUID(),
      })),
    };
  }

  // Ensure all leads have IDs
  const migrated = {};
  Object.keys(data).forEach((folder) => {
    migrated[folder] = data[folder].map((lead) => {
      // Handle string leads (legacy)
      if (typeof lead === "string") {
        return {
          id: crypto.randomUUID(),
          url: lead,
          name: truncateName(lead),
        };
      }
      return {
        ...lead,
        id: lead.id || crypto.randomUUID(),
      };
    });
  });

  return migrated;
};
