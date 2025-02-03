
import CardPosts from '@/components/CardPosts';
import CreatePost from '@/components/CreatePost';
import WhoToFollow from '@/components/WhoToFollow';
import { getPosts } from '@/server/_actions/posts';
import { authOptions } from '@/server/auth';
import { getUser } from '@/server/db/user'
import { getServerSession } from 'next-auth';
import React from 'react'

const page = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user?.id ? await getUser(session.user.id) : null;
  
  const posts = await getPosts();


  return (
    <div className='grid grid-cols-1 lg:grid-cols-10 gap-6 '>
      <div className='lg:col-span-6'>
        {user ?  <CreatePost user={user} /> : null    }
        <div className='space-y-6'>
          {posts.map((post) => {
            return (
              <CardPosts key={post.id} post={post} userId={user?.id ?? ""} session={session}/>
            )
          })}
        </div>
      </div>
      <div className='hidden lg:block lg:col-span-4'>
    <WhoToFollow />
</div>
    </div>
  )
}

export default page