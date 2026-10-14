import { tags } from 'typia';

export interface UserItemOutput {
  name: string;
  quantity: number & tags.Type<'int32'>;
}

export interface UserOutput {
  id: string & tags.Format<'uuid'>;
  email: string & tags.Format<'email'>;
  name: string;
  age: number & tags.Type<'int32'>;
  items: UserItemOutput[];
}
