import router from "express";
import { db } from "./firebaseAdmin";

const edcSeoRouter = router();

/** Base URL for product links in sitemap (frontend origin) */
const SITE_URL = process.env.FRONT_END_URL || "https://www.erindawncampbell.com";

/**
 * GET /edc-api/sitemap-products.xml
 * Returns a sitemap of product detail URLs for crawlers. Products are loaded from Firestore;
 * only non-sold, non-hidden products are included.
 */
edcSeoRouter.get("/sitemap-products.xml", async (_req, res) => {
  try {
    const snapshot = await db.collection("product").get();
    const urls: string[] = [];
    const today = new Date().toISOString().slice(0, 10);

    snapshot.docs.forEach((doc) => {
      const data = doc.data() as { sold?: boolean; hidden?: boolean };
      if (data.sold || data.hidden) return;
      const id = doc.id;
      const lastmod = doc.updateTime ? doc.updateTime.toDate().toISOString().slice(0, 10) : today;
      urls.push(
        `  <url>\n    <loc>${SITE_URL}/shop?id=${encodeURIComponent(id)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
      );
    });

    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.join("\n") +
      "\n</urlset>";

    res.set("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error("Sitemap products error:", err);
    res.status(500).send("Error generating sitemap");
  }
});

export default edcSeoRouter;
