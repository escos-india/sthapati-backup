import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserByEmail } from "@/lib/users";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { connectDB } from "@/lib/mongodb";
import { PostModel } from "@/models/Post";

export default async function ArticlesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    const rawUser = await getUserByEmail(session.user.email);
    if (!rawUser) {
        redirect("/login");
    }

    const user = JSON.parse(JSON.stringify(rawUser));

    // Fetch user's articles
    await connectDB();
    const rawPosts = await PostModel.find({ author: user._id }).sort({ createdAt: -1 }).populate("author").lean();
    const posts = JSON.parse(JSON.stringify(rawPosts));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 p-6 lg:p-10">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Articles</h1>
                        <p className="text-slate-500 dark:text-gray-400">Manage and view your published articles</p>
                    </div>
                </div>

                {posts.length > 0 ? (
                    <div className="space-y-6">
                        {posts.map((post: any) => (
                            <Card key={post._id} className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={post.author.image} />
                                            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">{post.author.name}</h4>
                                            <p className="text-sm text-slate-500 dark:text-gray-400">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                                    {post.image && (
                                        <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-gray-800">
                                            <img src={post.image} alt="Article attachment" className="w-full h-auto max-h-[400px] object-contain" />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-gray-800">
                                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                                            <ThumbsUp className="h-4 w-4" /> {post.likes} Likes
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                                            <MessageCircle className="h-4 w-4" /> {post.comments} Comments
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-slate-500 dark:text-gray-400 text-lg">You haven't posted any articles yet.</p>
                        <Button className="mt-4" asChild>
                            <Link href="/dashboard">Create Article</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
