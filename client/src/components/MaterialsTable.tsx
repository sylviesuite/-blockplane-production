import type { Material } from '../types';

type Props = { data: Material[]; loading?: boolean; error?: string | null };

export default function MaterialsTable({ data, loading, error }: Props) {
  if (loading) return <p className="p-4">Loading materials…</p>;
  if (error) return <p className="p-4 text-red-600">Error: {error}</p>;
  if (!data.length) return <p className="p-4">No materials found.</p>;

  return (
    <div className="p-4 overflow-x-auto">
      <table className="min-w-full border border-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Category</th>
            <th className="px-3 py-2 text-left">EE (MJ/kg)</th>
            <th className="px-3 py-2 text-left">CO₂ (kg/kg)</th>
            <th className="px-3 py-2 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m) => (
            <tr key={m.id} className="border-t">
              <td className="px-3 py-2">{m.name}</td>
              <td className="px-3 py-2">{m.category ?? '—'}</td>
              <td className="px-3 py-2">{m.embodiedEnergy_MJ_per_kg ?? '—'}</td>
              <td className="px-3 py-2">{m.co2_kg_per_kg ?? '—'}</td>
              <td className="px-3 py-2">{m.notes ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
