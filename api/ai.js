import doubao from "./doubao.js";
import gemini from "./gemini.js";

export default async function handler(req, res) {

  // 先尝试豆包
  try {

    let result = null;

    const fakeRes = {
      status(code) {
        this.code = code;
        return this;
      },
      json(data) {
        result = data;
      }
    };

    await doubao(req, fakeRes);

    if (result && result.success) {
      return res.json(result);
    }

    console.log("⚠ 豆包失败，切换 Gemini...");

  } catch (e) {
    console.log("⚠ 豆包异常：", e.message);
  }

  // 豆包失败 -> Gemini
  return gemini(req, res);

}
