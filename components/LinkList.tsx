"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Delete, ExternalLink } from "lucide-react";
import type { StoredShortLink } from "@/lib/shortlinks.types";

interface LinkListProps {
  links: StoredShortLink[];
}

export function LinkList({ links }: LinkListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const removeLink = useCallback(
    async (id: string) => {
      setDeleting(id);
      setMessage(null);
      try {
        const response = await fetch(`/api/links/${id}`, { method: "DELETE" });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          setMessage(error.error ?? "ลบลิงก์ไม่สำเร็จ");
          return;
        }
        setMessage("ลบลิงก์แล้ว");
      } catch {
        setMessage("ลบลิงก์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setDeleting(null);
      }
    },
    [],
  );

  if (links.length === 0) {
    return (
      <section className="links-empty">
        <p>ยังไม่มีลิงก์สั้นที่สร้างไว้</p>
        <p className="links-hint">
          ลิงก์จะถูกสร้างขึ้นเมื่อคุณกด <strong>Share → Copy link</strong> จาก
          หน้าหลัก
        </p>
      </section>
    );
  }

  return (
    <section className="links-list">
      <table>
        <thead>
          <tr>
            <th>ชื่อโปรเจกต์</th>
            <th className="links-id">ลิงก์สั้น</th>
            <th className="links-size">ขนาด</th>
            <th className="links-date">สร้างเมื่อ</th>
            <th className="links-action" />
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id}>
              <td>
                <Link href={`/s/${link.id}`} className="links-name">
                  {link.name}
                </Link>
                <a
                  href={`/s/${link.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="links-open"
                  title="เปิดดูตัวอย่าง"
                >
                  <ExternalLink size={13} />
                </a>
              </td>
              <td className="links-id">
                <code>{link.id}</code>
              </td>
              <td className="links-size">
                {(link.size / 1024).toFixed(1)} KB
              </td>
              <td className="links-date">
                {new Date(link.createdAt).toLocaleString("th-TH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </td>
              <td className="links-action">
                <button
                  type="button"
                  disabled={deleting === link.id}
                  onClick={() => removeLink(link.id)}
                  className="links-delete"
                  title="ลบลิงก์นี้"
                >
                  {deleting === link.id ? "กำลังลบ…" : <Delete size={14} />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {message && (
        <p className="links-message">{message}</p>
      )}
    </section>
  );
}
