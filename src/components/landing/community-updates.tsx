import { communityPosts } from '@/app/lib/data';
import { PostCard } from '../cards/post-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { MotionDiv } from '../utils/motion-div';
import { Button } from '../ui/button';
import Link from 'next/link';

export function CommunityUpdates() {
  return (
    <section 
      id="community" 
      className="relative w-full py-12 md:py-24 lg:py-32 text-foreground overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, hsl(var(--secondary)) 85%, hsl(var(--secondary) / 0.9) 100%)'
      }}
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <MotionDiv
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline tracking-tighter text-foreground">
            Updates from the Community
          </h2>
        </MotionDiv>
        {communityPosts.length > 0 ? (
          <div className="relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 md:-ml-6 lg:-ml-8">
                {communityPosts.map((post, index) => (
                  <CarouselItem key={post.id} className="pl-4 md:pl-6 lg:pl-8 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <MotionDiv
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        className="h-full"
                      >
                        <PostCard post={post} />
                      </MotionDiv>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 hidden xl:inline-flex" />
              <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 hidden xl:inline-flex" />
            </Carousel>
          </div>
        ) : (
          <MotionDiv
            className="text-center text-muted-foreground py-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <p className="mb-4">The community is quiet right now. Be the first to post!</p>
            <Button asChild>
              <Link href="/community">Join the Conversation</Link>
            </Button>
          </MotionDiv>
        )}
      </div>
    </section>
  );
}
