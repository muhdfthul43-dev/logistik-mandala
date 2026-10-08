"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveMasterPekerjaan, deleteMasterPekerjaan } from "./actions";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export function MasterPekerjaanClient({ data }: { data: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [nama, setNama] = useState("");
  
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; id: string }>({
    isOpen: false, id: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.append("nama_pekerjaan", nama);
      try {
        await saveMasterPekerjaan(formData);
        setNama("");
      } catch (err) {
        alert("Gagal menyimpan jenis pekerjaan.");
      }
    });
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({ isOpen: true, id });
  };
  
  const confirmDelete = () => {
    startTransition(async () => {
      try {
        await deleteMasterPekerjaan(confirmConfig.id);
      } catch {
        alert("Gagal menghapus.");
      }
    });
  };

  return (
    <div className="space-y-6 relative">
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title="Hapus Jenis Pekerjaan"
        message="Apakah Anda yakin ingin menghapus jenis pekerjaan ini dari daftar master?"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmConfig({ isOpen: false, id: "" })}
      />
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end rounded-2xl border border-surface-border/60 bg-surface p-6 shadow-sm">
        <div className="space-y-1.5 flex-1 w-full">
          <Label>Tambah Jenis Pekerjaan Baru</Label>
          <Input required value={nama} onChange={e => setNama(e.target.value)} placeholder="Contoh: ATK, Alat Bantu Kerja..." />
        </div>
        <Button type="submit" disabled={isPending || !nama} className="w-full sm:w-auto">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Tambah
        </Button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-surface-border/60 bg-surface shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border bg-surface-muted/50 text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Jenis Pekerjaan</th>
              <th className="px-4 py-3 font-medium text-right w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/60">
            {data.length === 0 ? (
              <tr><td colSpan={2} className="p-4 text-center text-ink-muted">Belum ada data</td></tr>
            ) : (
              data.map(row => (
                <tr key={row.id}>
                  <td className="px-4 py-3">{row.nama_pekerjaan}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(row.id)} disabled={isPending} className="p-1.5 text-ink-muted hover:text-bad rounded-lg hover:bg-bad/10">
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
