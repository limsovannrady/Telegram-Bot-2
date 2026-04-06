import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Users, Activity, UserPlus, Clock, Bot, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 30000,
    },
  },
});

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface BotUser {
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  language_code: string | null;
  first_seen: string;
  last_seen: string;
  message_count: number;
}

interface Stats {
  total: number;
  today: number;
  newThisWeek: number;
  activeThisWeek: number;
  dailyNewUsers: { date: string; new_users: number }[];
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const {
    data: users,
    isLoading: usersLoading,
    refetch,
    isRefetching,
  } = useQuery<BotUser[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const formatDate = (iso: string) => {
    try {
      return format(new Date(iso), "dd/MM/yyyy HH:mm");
    } catch {
      return iso;
    }
  };

  const chartData = stats?.dailyNewUsers.map((d) => ({
    date: d.date.toString().substring(0, 10),
    users: Number(d.new_users),
  })) ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bot Monitor</h1>
              <p className="text-xs text-gray-500">ត្រួតពិនិត្យអ្នកប្រើប្រាស់ Telegram Bot</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
            ធ្វើឱ្យស្រស់
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-24 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </div>
            ))
          ) : (
            <>
              <StatCard icon={Users} label="អ្នកប្រើប្រាស់សរុប" value={stats?.total ?? 0} color="bg-blue-500" />
              <StatCard icon={Activity} label="សកម្មថ្ងៃនេះ" value={stats?.today ?? 0} color="bg-green-500" />
              <StatCard icon={UserPlus} label="ថ្មីៗ ៧ ថ្ងៃ" value={stats?.newThisWeek ?? 0} color="bg-violet-500" />
              <StatCard icon={Clock} label="សកម្ម ៧ ថ្ងៃ" value={stats?.activeThisWeek ?? 0} color="bg-orange-500" />
            </>
          )}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">អ្នកប្រើប្រាស់ថ្មី (៣០ ថ្ងៃចុងក្រោយ)</h2>
          {statsLoading ? (
            <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>មិនទាន់មានទិន្នន័យ</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  tickFormatter={(v) => {
                    try { return format(parseISO(v), "MM/dd"); } catch { return v; }
                  }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "13px" }}
                  labelFormatter={(v) => {
                    try { return format(parseISO(v as string), "dd/MM/yyyy"); } catch { return v; }
                  }}
                  formatter={(value) => [value, "អ្នកប្រើប្រាស់ថ្មី"]}
                />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              បញ្ជីអ្នកប្រើប្រាស់
            </h2>
            <span className="text-sm text-gray-500">{users?.length ?? 0} នាក់</span>
          </div>
          <div className="overflow-x-auto">
            {usersLoading ? (
              <div className="p-8 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : !users || users.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">មិនទាន់មានអ្នកប្រើប្រាស់</p>
                <p className="text-sm mt-1">ចាំរហូតដល់មនុស្សប្រើ bot</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3 font-medium">អ្នកប្រើប្រាស់</th>
                    <th className="px-6 py-3 font-medium">Username</th>
                    <th className="px-6 py-3 font-medium">Telegram ID</th>
                    <th className="px-6 py-3 font-medium">ភាសា</th>
                    <th className="px-6 py-3 font-medium">ចូលលើកដំបូង</th>
                    <th className="px-6 py-3 font-medium">ចូលចុងក្រោយ</th>
                    <th className="px-6 py-3 font-medium">ចំនួនសារ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.telegram_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-semibold text-xs">
                              {(user.first_name?.[0] ?? user.username?.[0] ?? "?").toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {[user.first_name, user.last_name].filter(Boolean).join(" ") || "គ្មានឈ្មោះ"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.username ? (
                          <a
                            href={`https://t.me/${user.username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            @{user.username}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{user.telegram_id}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                          {user.language_code ?? "?"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(user.first_seen)}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(user.last_seen)}</td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800">{user.message_count}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
