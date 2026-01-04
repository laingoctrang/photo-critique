import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { adminStatisticsService, type ChartPeriod } from "../../services/adminStatisticsService";
import { showToast, formatDateTime } from "../../utils";
import { ToastType } from "../../components";
import { ArrowPathIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const AdminDashboard = () => {
  const [overview, setOverview] = useState<any>(null);
  const [activityChart, setActivityChart] = useState<any>(null);
  const [userEngagement, setUserEngagement] = useState<any>(null);
  
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingEngagement, setLoadingEngagement] = useState(true);
  
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("MONTH");

  useEffect(() => {
    loadOverview();
    loadActivityChart();
    loadUserEngagement();
  }, []);

  useEffect(() => {
    loadActivityChart();
  }, [chartPeriod]);

  const loadOverview = async () => {
    try {
      setLoadingOverview(true);
      const data = await adminStatisticsService.getOverview();
      setOverview(data);
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message || "Failed to load overview statistics");
    } finally {
      setLoadingOverview(false);
    }
  };

  const loadActivityChart = async () => {
    try {
      setLoadingChart(true);
      const data = await adminStatisticsService.getActivityChart(chartPeriod);
      setActivityChart(data);
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message || "Failed to load activity chart");
    } finally {
      setLoadingChart(false);
    }
  };

  const loadUserEngagement = async () => {
    try {
      setLoadingEngagement(true);
      const data = await adminStatisticsService.getUserEngagement();
      setUserEngagement(data);
    } catch (error: any) {
      showToast(ToastType.ERROR, error.message || "Failed to load user engagement");
    } finally {
      setLoadingEngagement(false);
    }
  };

  const chartData = activityChart ? {
    labels: activityChart.posts.map((p: any) => p.label),
    datasets: [
      {
        label: "Posts",
        data: activityChart.posts.map((p: any) => p.count),
        borderColor: "#15B8A6",
        backgroundColor: "rgba(21, 184, 166, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Comments",
        data: activityChart.comments.map((p: any) => p.count),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        borderDash: [5, 5],
      },
      {
        label: "AI Tool Usage",
        data: activityChart.aiToolUsage.map((p: any) => p.count),
        borderColor: "#8B5CF6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#6B7280",
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: "#6B7280",
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: "#6B7280",
        },
      },
    },
  };

  const userEngagementData = userEngagement ? {
    labels: ["Active (last 30 days)", "Inactive (30+ days)"],
    datasets: [
      {
        data: [userEngagement.activeUsers, userEngagement.inactiveUsers],
        backgroundColor: ["#15B8A6", "#6B7280"],
        borderWidth: 0,
      },
    ],
  } : null;

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#6B7280",
          padding: 15,
        },
      },
    },
  };

  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getPercentageChange = (current: number, previous: number) => {
    const change = calculatePercentageChange(current, previous);
    const isPositive = change >= 0;
    return { change: Math.abs(change), isPositive };
  };

  return (
    <div className="min-h-screen bg-white p-6 rounded-4xl shadow-sm">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          {overview?.fetchedAt && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Last updated: {formatDateTime(overview.fetchedAt)}
              </span>
              <button
                onClick={loadOverview}
                disabled={loadingOverview}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-gray-600 ${loadingOverview ? "animate-spin" : ""}`} />
              </button>
            </div>
          )}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Users */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 leading-none">
                  {loadingOverview ? "..." : overview?.totalUsers.toLocaleString() || "0"}
                </div>
                <div className="text-xs text-gray-500 mt-1">Total Users</div>
              </div>
            </div>
          </div>

          {/* Total Posts */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#15B8A6]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#15B8A6]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 leading-none">
                  {loadingOverview ? "..." : overview?.totalPosts.toLocaleString() || "0"}
                </div>
                <div className="text-xs text-gray-500 mt-1">Total Posts</div>
              </div>
            </div>
            {overview && (
              <div className="space-y-2 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">This month</span>
                  <span className="text-lg font-semibold text-[#15B8A6]">
                    {overview.thisMonthPosts.toLocaleString()}
                  </span>
                </div>
                {overview.lastMonthPosts !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">vs last month</span>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const { change, isPositive } = getPercentageChange(overview.thisMonthPosts, overview.lastMonthPosts);
                        return (
                          <>
                            {isPositive ? (
                              <ArrowUpIcon className="w-4 h-4 text-green-500" />
                            ) : (
                              <ArrowDownIcon className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                              {change.toFixed(1)}%
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Total Comments */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 leading-none">
                  {loadingOverview ? "..." : overview?.totalComments.toLocaleString() || "0"}
                </div>
                <div className="text-xs text-gray-500 mt-1">Comments</div>
              </div>
            </div>
            {overview && (
              <div className="space-y-2 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">This month</span>
                  <span className="text-lg font-semibold text-orange-500">
                    {overview.thisMonthComments.toLocaleString()}
                  </span>
                </div>
                {overview.lastMonthComments !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">vs last month</span>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const { change, isPositive } = getPercentageChange(overview.thisMonthComments, overview.lastMonthComments);
                        return (
                          <>
                            {isPositive ? (
                              <ArrowUpIcon className="w-4 h-4 text-green-500" />
                            ) : (
                              <ArrowDownIcon className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                              {change.toFixed(1)}%
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Total AI Tool Usage */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 leading-none">
                  {loadingOverview ? "..." : overview?.totalAiToolUsage.toLocaleString() || "0"}
                </div>
                <div className="text-xs text-gray-500 mt-1">Total Generations</div>
              </div>
            </div>
            {overview && (
              <div className="space-y-2 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">This month</span>
                  <span className="text-lg font-semibold text-purple-500">
                    {overview.thisMonthAiToolUsage.toLocaleString()}
                  </span>
                </div>
                {overview.lastMonthAiToolUsage !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">vs last month</span>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const { change, isPositive } = getPercentageChange(overview.thisMonthAiToolUsage, overview.lastMonthAiToolUsage);
                        return (
                          <>
                            {isPositive ? (
                              <ArrowUpIcon className="w-4 h-4 text-green-500" />
                            ) : (
                              <ArrowDownIcon className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                              {change.toFixed(1)}%
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Chart - Left Large */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">User & Generation Activity</h2>
                <p className="text-sm text-gray-500">Daily active users vs generations created</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartPeriod("WEEK")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    chartPeriod === "WEEK"
                      ? "bg-[#15B8A6] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setChartPeriod("MONTH")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    chartPeriod === "MONTH"
                      ? "bg-[#15B8A6] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setChartPeriod("YEAR")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    chartPeriod === "YEAR"
                      ? "bg-[#15B8A6] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
            <div className="h-80">
              {loadingChart ? (
                <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
              ) : chartData ? (
                <Line data={chartData} options={chartOptions} />
              ) : null}
            </div>
          </div>

          {/* User Engagement */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">User Engagement</h3>
                <p className="text-xs text-gray-500 mt-1">Based on last seen activity</p>
              </div>
              <button
                onClick={loadUserEngagement}
                disabled={loadingEngagement}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowPathIcon className={`w-4 h-4 text-gray-600 ${loadingEngagement ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="h-80">
              {loadingEngagement ? (
                <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
              ) : userEngagementData ? (
                <div className="flex flex-col h-full">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#15B8A6]">{userEngagement.activePercentage.toFixed(1)}%</div>
                    <div className="text-sm text-gray-500">Recently Active Users</div>
                  </div>
                  <div className="flex-1">
                    <Doughnut data={userEngagementData} options={doughnutOptions} />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
