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

  // Fetch orders from Supabase
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Supabase Query Error:", error.message)
  }

  const orderList = orders || []

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold leading-7 text-slate-900 sm:truncate sm:text-4xl sm:tracking-tight">
              Pexpacks Order Management
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Live orders, pre-lay-by schedules, and fulfillment statuses.
            </p>
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-100/80">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-xs">
                    Order Ref
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-xs">
                    Buyer & School
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-xs">
                    Learner & Grade
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-xs">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wider text-xs">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {orderList.length > 0 ? (
                  orderList.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-slate-900">
                        {order.order_reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{order.buyer_name}</div>
                        <div className="text-xs text-slate-500">{order.school_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-slate-800">{order.learner_name}</div>
                        <div className="text-xs text-slate-400">Grade {order.grade}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                        R {order.estimated_total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          order.status === 'paid' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* Empty State when zero orders exist */
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto">
                        <p className="font-semibold text-slate-600 text-base">No orders yet</p>
                        <p className="text-xs mt-1">
                          When parents complete checkout, their orders will populate here automatically.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
