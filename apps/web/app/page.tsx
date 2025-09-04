export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">🎉 SUCCESS! New Design is Working!</h1>
        <p className="text-xl text-muted-foreground mb-6">
          This is the new Celerentis UI with dark theme and modern design.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
            <p className="text-muted-foreground">View your projects and analytics</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Projects</h3>
            <p className="text-muted-foreground">Manage your Information Memoranda</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Templates</h3>
            <p className="text-muted-foreground">Browse and use templates</p>
          </div>
        </div>
      </div>
    </div>
  )
}