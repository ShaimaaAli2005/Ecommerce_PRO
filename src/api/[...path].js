export default async function handler(req, res) {
  // تحديد السيرفر الأصلي المستهدف
  const targetBaseUrl = "https://e-commerce-api-3wara.vercel.app";

  // استخراج المسار المطلوب من الطلب
  const path = req.query.path ? req.query.path.join('/') : '';
  const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  const targetUrl = `${targetBaseUrl}/${path}${queryString}`;

  try {
    // تجهيز الترويسات (Headers) مع تمرير الكوكيز وتوكن المصادقة
    const headers = {
      "Content-Type": req.headers["content-type"] || "application/json",
    };
    if (req.headers["authorization"]) {
      headers["Authorization"] = req.headers["authorization"];
    }
    if (req.headers["cookie"]) {
      headers["Cookie"] = req.headers["cookie"];
    }

    // إرسال الطلب للسيرفر الأصلي باستخدام fetch المدمجة
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body),
    });

    const data = await response.text();

    // نقل كوكيز المصادقة العائدة من السيرفر للمتصفح إن وجدت
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      res.setHeader("Set-Cookie", setCookie);
    }

    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: "Proxy Error", details: error.message });
  }
}