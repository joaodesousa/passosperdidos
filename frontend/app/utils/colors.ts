export const getPartyColor = (party: string | null): string => {
    switch(party) {
      case "PS":
        return "bg-pink-400 text-white";
      case "PSD":
        return "bg-orange-500 text-white";
      case "CH":
        return "bg-blue-950 text-white";
      case "IL":
        return "bg-cyan-400 text-white";
      case "PCP":
        return "bg-red-800 text-white";
      case "BE":
        return "bg-red-600 text-white";
      case "CDS-PP":
        return "bg-blue-500 text-white";
      case "L":
        return "bg-green-500 text-white";
      case "PAN":
        return "bg-green-800 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };
  
  // Helper to get status color
  export const getStatusColor = (phaseName: string): string => {
    if (phaseName.includes("Aprovad")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    if (phaseName.includes("Rejeitad")) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
    if (phaseName.includes("Caducad")) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
  };