import { List, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { listShortLinks } from "@/lib/shortlinks";
import type { StoredShortLink } from "@/lib/shortlinks.types";
import { LinkList } from "@/components/LinkList";

export const dynamic = "force-dynamic";

export default async function LinksPage() {
  let links: StoredShortLink[] = [];
  let databaseError = false;

  try {
    links = await listShortLinks();
  } catch (error) {
    console.error("[links] could not load short links", error);
    databaseError = true;
  }

  return (
    <main className="doc-shell">
      <section className="doc-layout">
        <nav className="links-nav" aria-label="ข้อมูลโปรเจกต์ที่แชร์">
          <h1>จัดการลิงก์แชร์</h1>
          <p className="links-intro">
            หน้านี้แสดงเฉพาะลิงก์สั้น ({"/s/<id>"}) ที่คุณสร้างผ่าน
            <strong>Share → Copy link</strong> ในหน้าหลักเท่านั้น
          </p>
          <div className="links-actions">
            <Link className="btn btn-primary" href="/">
              <List size={14} />
              กลับไปหน้าหลัก
            </Link>
          </div>
          <div className="links-warning">
            <ShieldAlert size={16} />
            <strong>คำเตือน:</strong> เว็บไซต์นี้ยังไม่มีระบบล็อกอิน
            {" "}
            <strong>ใครก็ตามที่เปิดหน้านี้จะเห็นและลบลิงก์ทั้งหมดได้</strong>
            หากต้องการความเป็นส่วนตัว ให้ใช้{" "}
            <strong>Use a long link instead</strong> ซึ่งเก็บทุกอย่างไว้ใน
            URL แทนที่จะเก็บบนเซิร์ฟเวอร์
          </div>
        </nav>

        <aside className="links-list-wrap">
          {databaseError ? (
            <section className="links-empty">
              <p>
                <strong>เชื่อมต่อฐานข้อมูล Turso ไม่ได้</strong>
              </p>
              <p className="links-hint">
                ตั้งค่า <code>TURSO_DATABASE_URL</code> และ{" "}
                <code>TURSO_AUTH_TOKEN</code> ใน environment แล้วรีสตาร์ทเซิร์ฟเวอร์
                จากนั้นลิงก์สั้นที่สร้างใหม่จะแสดงที่นี่
              </p>
            </section>
          ) : (
            <LinkList links={links} />
          )}
        </aside>
      </section>
    </main>
  );
}
