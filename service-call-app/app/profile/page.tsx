import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getSession } from "@auth0/nextjs-auth0";

export default async function ProfilePage() {
  const session = await getSession();
  const user = session!.user;
  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6 pt-20">
      {/* Profile Card */}
      <Card>
        <CardHeader className="flex flex-col items-center">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.picture ?? ""} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4 text-2xl font-semibold">
            {user.name}
          </CardTitle>
          <p className="text-gray-500">{user.email}</p>
        </CardHeader>
      </Card>
    </div>
  );
}
