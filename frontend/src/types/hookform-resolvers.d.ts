declare module '@hookform/resolvers/zod' {
    import { Resolver } from 'react-hook-form';
    import { Schema } from 'zod';
    export const zodResolver: (schema: Schema, schemaOptions?: any, resolverOptions?: any) => Resolver<any, any>;
}
