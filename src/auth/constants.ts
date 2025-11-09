// define jwt secret used in encoding when create jwt, and decoding when verify the jwt
export const jwtConstants = {
  secret:
    process.env.JWT_secret || 'secret',
};