"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card } from "@/components/ui/card";

export function MaterialBarChart({ data }: { data: { name: string; diajukan: number; terpenuhi: number }[] }) {
  return (
    <Card className="p-6 h-[400px] flex flex-col">
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold text-ink">Pemenuhan Material per Jenis Pekerjaan</h3>
        <p className="text-sm text-ink-muted">Membandingkan kuantitas material diajukan vs diterima di lapangan.</p>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e5e4" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#5b6672" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#5b6672" }} />
            <RechartsTooltip 
              cursor={{ fill: '#eef0ef' }}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e5e4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
            <Bar dataKey="diajukan" name="Diajukan" fill="#8a94a6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="terpenuhi" name="Terpenuhi" fill="#0b7285" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function PipelineDonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <Card className="p-6 h-[400px] flex flex-col">
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold text-ink">Pipa Pengadaan (Pipeline)</h3>
        <p className="text-sm text-ink-muted">Distribusi status dokumen logistik saat ini.</p>
      </div>
      <div className="flex-1 w-full min-h-0 relative flex items-center justify-center">
        {data.every(d => d.value === 0) ? (
           <p className="text-sm text-ink-muted text-center">Belum ada data dokumen.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 0, bottom: 10, left: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e5e4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '8px 12px' }}
                itemStyle={{ color: '#1b1d1f', fontSize: '14px', fontWeight: 500 }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} 
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
