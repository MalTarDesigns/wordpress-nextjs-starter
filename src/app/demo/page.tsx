import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DemoPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Tailwind CSS & shadcn/ui Demo</h1>
        <ThemeToggle />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Components</CardTitle>
            <CardDescription>shadcn/ui components are working perfectly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button>Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>Beautiful typography with Tailwind CSS</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h4>Heading 4</h4>
              <p>This is a paragraph with some <strong>bold text</strong> and <em>italic text</em>.</p>
              <ul>
                <li>List item one</li>
                <li>List item two</li>
                <li>List item three</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dark Mode</CardTitle>
            <CardDescription>Toggle between light and dark themes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Click the theme toggle button to switch between light and dark modes. 
              The theme is persisted across page reloads.
            </p>
            <div className="p-4 border rounded bg-muted/50">
              <p className="text-sm">This box demonstrates theme colors</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Responsive Layout</CardTitle>
          <CardDescription>This layout adapts to different screen sizes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 bg-primary/10 rounded text-center">
              <h5 className="font-medium">Mobile First</h5>
              <p className="text-sm text-muted-foreground">Base styles</p>
            </div>
            <div className="p-4 bg-secondary/10 rounded text-center">
              <h5 className="font-medium">Tablet</h5>
              <p className="text-sm text-muted-foreground">sm: breakpoint</p>
            </div>
            <div className="p-4 bg-accent/10 rounded text-center">
              <h5 className="font-medium">Desktop</h5>
              <p className="text-sm text-muted-foreground">lg: breakpoint</p>
            </div>
            <div className="p-4 bg-muted/50 rounded text-center">
              <h5 className="font-medium">Large</h5>
              <p className="text-sm text-muted-foreground">xl: breakpoint</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Setup Complete!</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Tailwind CSS and shadcn/ui are now properly configured in your WordPress Next.js starter.
          You can start building beautiful, responsive components with dark mode support.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer">
              Tailwind Docs
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://ui.shadcn.com/docs" target="_blank" rel="noopener noreferrer">
              shadcn/ui Docs
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}