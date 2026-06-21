import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/Button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <MobileLayout hideNav>
      <div className="flex flex-col items-center justify-center h-full px-6 text-center mt-32">
        <h1 className="text-6xl font-display font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h2>
        <p className="text-gray-500 mb-8">The page you are looking for doesn't exist or has been moved.</p>
        <Link href="/" className="w-full max-w-[200px]">
          <Button className="w-full">Go Home</Button>
        </Link>
      </div>
    </MobileLayout>
  );
}
