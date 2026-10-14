import { tags } from 'typia';

export interface BenchmarkItem {
  name: string & tags.MinLength<2> & tags.MaxLength<80>;
  quantity: number & tags.Type<'int32'> & tags.Minimum<1> & tags.Maximum<1000>;
}

export interface BenchmarkInput {
  id: string & tags.Format<'uuid'>;
  email: string & tags.Format<'email'>;
  name: string & tags.MinLength<2> & tags.MaxLength<100>;
  age: number & tags.Type<'int32'> & tags.Minimum<18> & tags.Maximum<100>;
  items: BenchmarkItem[];
}
