import { Prisma } from "@prisma/client";

export type UserWithRelations = Prisma.UserGetPayload<{
 include : {
    _count : { 
        select : {
            followers : true,
            following : true,
            posts : true
        }
    }
 }
}>;