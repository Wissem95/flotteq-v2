/**
 * Composant de test pour valider les breakpoints TailwindCSS
 * À supprimer après validation
 */
export function ResponsiveTest() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Test Breakpoints TailwindCSS</h2>

      {/* Test breakpoints */}
      <div className="space-y-2">
        <div className="xs:bg-red-100 sm:bg-blue-100 md:bg-green-100 lg:bg-yellow-100 xl:bg-purple-100 2xl:bg-pink-100 p-4 rounded">
          <p className="font-mono text-sm">
            <span className="xs:inline hidden">XS (375px+)</span>
            <span className="sm:inline hidden">SM (640px+)</span>
            <span className="md:inline hidden">MD (768px+)</span>
            <span className="lg:inline hidden">LG (1024px+)</span>
            <span className="xl:inline hidden">XL (1280px+)</span>
            <span className="2xl:inline hidden">2XL (1536px+)</span>
          </p>
        </div>

        {/* Test safe-area */}
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm">Safe Area Top:
            <span className="font-mono ml-2 pt-safe-top inline-block bg-blue-200 px-2">
              Test
            </span>
          </p>
          <p className="text-sm mt-2">Safe Area Bottom:
            <span className="font-mono ml-2 pb-safe-bottom inline-block bg-blue-200 px-2">
              Test
            </span>
          </p>
        </div>

        {/* Test touch target */}
        <button className="min-h-touch min-w-touch bg-green-500 text-white rounded px-4">
          Touch Target (44px min)
        </button>
      </div>
    </div>
  );
}
