import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll() { return cookieStore.getAll() } }
    }
  )

  // Fetch real-time orders directly from Supabase
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Pexpacks Order Management</h1>
      
      <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-200">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b text-slate-700 font-semibold uppercase text-xs">
            <tr>
              <th className="p-4">Ref</th>
              <th className="p-4">Buyer & School</th>
              <th className="p-4">Learner & Grade</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders && orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-mono font-bold text-slate-900">{order.order_reference}</td>
                <td className="p-4">
                  <div className="font-semibold text-slate-900">{order.buyer_name}</div>
                  <div className="text-xs text-slate-500">{order.school_name}</div>
                </td>
                <td className="p-4">
                  <div>{order.learner_name}</div>
                  <div className="text-xs text-slate-400">Grade: {order.grade}</div>
                </td>
                <td className="p-4 font-semibold text-slate-900">R {order.estimated_total}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    order.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
