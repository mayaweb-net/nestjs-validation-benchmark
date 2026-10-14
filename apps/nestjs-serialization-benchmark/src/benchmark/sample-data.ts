export type SampleItem = {
  name: string;
  quantity: number;
};

export type SampleUser = {
  id: string;
  email: string;
  name: string;
  age: number;
  password: string;
  items: SampleItem[];
};

export function makeSampleUser(itemCount = 20): SampleUser {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'benchmark@example.com',
    name: 'Benchmark User',
    age: 28,
    password: 'super-secret-password',
    items: Array.from({ length: itemCount }, (_, i) => ({
      name: `Item ${i + 1}`,
      quantity: (i % 1000) + 1,
    })),
  };
}

/** Public JSON shape expected by clients (password excluded). */
export function toPublicUser(user: SampleUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    age: user.age,
    items: user.items,
  };
}
