export function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = decodeURIComponent(atob(base64Url).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(base64);
    } catch (e) {
      return null;
    }
  }
  
  export function isTokenExpired(token) {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return now > payload.exp;
  }
  