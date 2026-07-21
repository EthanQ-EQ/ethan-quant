export default async function handler(req, res) {
  const { code } = req.query;

  res.status(200).json({
    success: true,
    code: code
  });
}
