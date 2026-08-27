import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function SignalTrendChart({ data }) {
  return (
    <div className="h-64" aria-label="Last 14 days of synthetic signal trends">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={2} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="ashaReports" name="ASHA reports" stroke="#3d5a80" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="opdCases" name="OPD cases" stroke="#577590" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="pharmacyDemand" name="Pharmacy demand" stroke="#6d597a" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SignalTrendChart
