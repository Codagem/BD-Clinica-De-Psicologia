import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export async function criarSessao(dados) {
  return await new SignJWT(dados)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verificarSessao(token) {
  try {
    const { payload } = await jwtVerify(token, secret);

    return payload;
  } catch {
    return null;
  }
}