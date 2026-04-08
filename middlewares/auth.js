export function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.redirect('/login');
  }
  return next();
}

export function requireProfessor(req, res, next) {
  if (!req.session?.user) {
    return res.redirect('/login');
  }

  if (req.session.user.role !== 'professor') {
    return res.status(403).send('Apenas professores podem criar postagens.');
  }

  return next();
}

export function canManagePost(req, post) {
  if (!req.session?.user) return false;
  if (req.session.user.role === 'professor') return true;
  return String(post.autorId) === String(req.session.user.id);
}
