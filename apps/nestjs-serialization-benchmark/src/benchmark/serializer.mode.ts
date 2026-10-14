export const SERIALIZER_MODES = [
  'default',
  'class-transformer',
  'typia',
  'manual',
] as const;

export type SerializerMode = (typeof SERIALIZER_MODES)[number];

export function getSerializerMode(): SerializerMode {
  const mode = (process.env.SERIALIZER || 'default').toLowerCase();
  if (!SERIALIZER_MODES.includes(mode as SerializerMode)) {
    throw new Error(
      `SERIALIZER must be one of: ${SERIALIZER_MODES.join(', ')}. Got "${mode}"`,
    );
  }
  return mode as SerializerMode;
}
