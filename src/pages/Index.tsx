
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Flame, BookText, Award, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";

const features = [
  {
    icon: <Flame className="h-10 w-10 text-primary" />,
    title: "Daily Check-ins",
    description: "Mark your spiritual presence each day to build consistency in your relationship with God."
  },
  {
    icon: <BookText className="h-10 w-10 text-primary" />,
    title: "Prayer Journal",
    description: "Document your prayers and the insights you receive during your spiritual practice."
  },
  {
    icon: <Award className="h-10 w-10 text-primary" />,
    title: "Streak System",
    description: "Build and maintain streaks to encourage consistent spiritual discipline."
  },
  {
    icon: <Calendar className="h-10 w-10 text-primary" />,
    title: "Streak Freeze",
    description: "Use streak freezes to maintain your progress even when life gets busy."
  }
];

export default function Index() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <Navbar />
      <main className="flex flex-col min-h-screen">
        <div className="flex-1">
          {/* Hero Section */}
          <section className="relative pt-24 overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
            <div className="container px-4 mx-auto max-w-5xl">
              <div className="flex flex-col items-center text-center py-20 md:py-28 animate-fade-in">
                <div className="space-y-4 max-w-3xl">
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                    Track Your Spiritual Journey with <span className="text-primary">Bethel</span>
                  </h1>
                  <p className="text-xl text-muted-foreground md:text-2xl max-w-2xl mx-auto">
                    Build consistency in your spiritual life by documenting prayers, 
                    insights, and maintaining daily check-ins.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <Button size="lg" asChild className="font-medium px-8">
                      <Link to="/login?signup=true">Get Started</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="font-medium px-8">
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 md:py-24 bg-secondary/50">
            <div className="container px-4 mx-auto max-w-5xl">
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Features</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Everything you need to maintain consistency in your spiritual journey
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-card rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-md hover:translate-y-[-4px]">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 md:py-24">
            <div className="container px-4 mx-auto max-w-5xl">
              <div className="bg-card rounded-xl p-8 md:p-12 shadow-md border text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Join Soul Tracker today and build a consistent spiritual practice that will transform your relationship with God.
                </p>
                <Button size="lg" asChild className="font-medium px-8">
                  <Link to="/login?signup=true">Create Your Account</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t py-8">
          <div className="container px-4 mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <div className="font-display text-xl font-semibold flex items-center">
                  <span className="bg-primary text-primary-foreground py-1 px-2 rounded mr-1">Bethel</span>
               
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 md:items-center text-sm text-muted-foreground">
                <p>© 2025 Bethel. All rights reserved.</p>
                <div className="flex gap-4 justify-center">
                  <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
                  <Link to="#" className="hover:text-foreground transition-colors">Terms</Link>
                  <Link to="#" className="hover:text-foreground transition-colors">Contact</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
