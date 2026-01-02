"use client";
const StatusFilter = ({ status }: { status: string }) => {
  return (
    <select
      defaultValue={status || "all"}
      onChange={(e) => {
        const url = new URL(window.location.href);
        if (e.target.value !== "all") {
          url.searchParams.set("status", e.target.value);
        } else {
          url.searchParams.delete("status");
        }
        window.location.href = url.toString();
      }}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="all">All Status</option>
      <option value="SUBMITTED">Submitted</option>
      <option value="UNDER_REVIEW">Under Review</option>
      <option value="NEGOTIATION">Negotiation</option>
      <option value="ACCEPTED">Accepted</option>
      <option value="REJECTED">Rejected</option>
    </select>
  );
};

export default StatusFilter;
