import { List, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { listShortLinks } from "@/lib/shortlinks";
import { LinkList } from "@/components/LinkList";

export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const links = await listShortLinks();

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
          <LinkList links={links} />
        </aside>
      </section>
    </main>
  );
}
