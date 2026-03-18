// Instagram Graph API — affiche les derniers posts du compte
// Configuration requise dans .env :
//   INSTAGRAM_ACCESS_TOKEN — token long-lived (valide 60 jours)
//   INSTAGRAM_USER_ID      — ID numérique du compte Instagram
//
// Pour renouveler le token avant expiration :
//   GET /api/instagram/refresh  (admin uniquement)
//
// Obtenir les tokens : https://developers.facebook.com/tools/explorer/

exports.getInstagramFeed = async (req, res) => {
  const token  = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    return res.json({ photos: [] });
  }

  try {
    const url = `https://graph.instagram.com/${userId}/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption&limit=9&access_token=${token}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.data) return res.json({ photos: [] });

    const photos = data.data
      .filter((p) => p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM")
      .map((p) => ({
        src:       p.media_url,
        alt:       p.caption ? p.caption.slice(0, 80) : "Photo",
        permalink: p.permalink,
      }));

    res.json({ photos });
  } catch (err) {
    console.error("Instagram API error:", err.message);
    res.json({ photos: [] });
  }
};

// Renouvelle le token long-lived avant ses 60 jours d'expiration
// À appeler manuellement depuis le panel admin ou via curl
exports.refreshInstagramToken = async (req, res) => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return res.status(400).json({ error: "INSTAGRAM_ACCESS_TOKEN non configuré" });

  try {
    const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refreshed_token&access_token=${token}`;
    const response = await fetch(url);
    const data = await response.json();
    // data.access_token contient le nouveau token — mettre à jour le .env
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
