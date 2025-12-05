import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Menu } from 'lucide-react';

/**
 * Composant de test pour valider l'installation de shadcn/ui
 * À supprimer après validation
 */
export function ShadcnTest() {
  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">shadcn/ui Installation Test</h1>

      {/* Card Component */}
      <Card>
        <CardHeader>
          <CardTitle>✅ Installation Réussie</CardTitle>
          <CardDescription>Tous les composants shadcn/ui sont installés et fonctionnels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Button Component */}
          <div className="space-y-2">
            <h3 className="font-semibold">Buttons</h3>
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          {/* Badge Component */}
          <div className="space-y-2">
            <h3 className="font-semibold">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          {/* Skeleton Component */}
          <div className="space-y-2">
            <h3 className="font-semibold">Skeleton (Loading)</h3>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>

          {/* Table Component */}
          <div className="space-y-2">
            <h3 className="font-semibold">Table</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Composant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Version</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Button</TableCell>
                    <TableCell><Badge variant="outline">✅ OK</Badge></TableCell>
                    <TableCell>1.0.0</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Card</TableCell>
                    <TableCell><Badge variant="outline">✅ OK</Badge></TableCell>
                    <TableCell>1.0.0</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sheet</TableCell>
                    <TableCell><Badge variant="outline">✅ OK</Badge></TableCell>
                    <TableCell>1.0.0</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Sheet Component */}
          <div className="space-y-2">
            <h3 className="font-semibold">Sheet (Mobile Drawer)</h3>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Menu className="mr-2 h-4 w-4" />
                  Ouvrir Sheet
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Sheet Component</SheetTitle>
                  <SheetDescription>
                    Ce composant sera utilisé pour la navigation mobile
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-2">
                  <p>✅ Sheet fonctionne parfaitement</p>
                  <p>🎯 Idéal pour le menu mobile</p>
                  <p>📱 Responsive et accessible</p>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </CardContent>
      </Card>

      {/* Responsive Test */}
      <Card>
        <CardHeader>
          <CardTitle>Test Responsive + shadcn/ui</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="xs:bg-red-50 sm:bg-blue-50 md:bg-green-50 lg:bg-yellow-50 xl:bg-purple-50 2xl:bg-pink-50 p-4 rounded">
            <p className="font-mono text-sm">
              <span className="xs:inline hidden">XS (375px+) + shadcn/ui ✅</span>
              <span className="sm:inline hidden">SM (640px+) + shadcn/ui ✅</span>
              <span className="md:inline hidden">MD (768px+) + shadcn/ui ✅</span>
              <span className="lg:inline hidden">LG (1024px+) + shadcn/ui ✅</span>
              <span className="xl:inline hidden">XL (1280px+) + shadcn/ui ✅</span>
              <span className="2xl:inline hidden">2XL (1536px+) + shadcn/ui ✅</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
