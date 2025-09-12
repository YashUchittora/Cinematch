import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { movieApi, Movie } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { MoviesGrid } from '@/components/MoviesGrid';
import { Sparkles, Heart } from 'lucide-react';

interface RecommendationFormProps {
  onClose?: () => void;
}

export const RecommendationForm = ({ onClose }: RecommendationFormProps) => {
  const [mode, setMode] = useState<'movie' | 'mood'>('movie');
  const [movieName, setMovieName] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const moods = [
    { value: 'happy', label: 'Happy' },
    { value: 'sad', label: 'Sad' },
    { value: 'excited', label: 'Excited' },
    { value: 'relaxed', label: 'Relaxed' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'movie' && !movieName.trim()) {
      toast({
        title: "Movie Required",
        description: "Please enter a movie name",
        variant: "destructive",
      });
      return;
    }

    if (mode === 'mood' && !selectedMood) {
      toast({
        title: "Mood Required", 
        description: "Please select a mood",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(() => {
      toast({
        title: "Still Processing...",
        description: "This is taking longer than usual. Please wait a moment.",
      });
    }, 10000); // Show message after 10 seconds

    try {
      const requestData = mode === 'movie' 
        ? { mode, movie_name: movieName }
        : { mode, mood: selectedMood };

      const results = await movieApi.getRecommendations(requestData);
      clearTimeout(timeoutId);
      setRecommendations(results);
      
      toast({
        title: "Recommendations Ready!",
        description: `Found ${results.length} movie recommendations`,
      });
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Failed to get recommendations:', error);
      
      let errorMessage = "Failed to get recommendations. Please try again.";
      if (error.message?.includes('timeout')) {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again in a moment.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || "Invalid request. Please check your input.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Get Movie Recommendations
          </CardTitle>
          <CardDescription>
            Choose how you'd like to discover new movies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mode Selection */}
            <div>
              <Label className="text-base font-medium">Recommendation Mode</Label>
              <RadioGroup 
                value={mode} 
                onValueChange={(value: 'movie' | 'mood') => setMode(value)}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="movie" id="movie" />
                  <Label htmlFor="movie">Based on Movie</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mood" id="mood" />
                  <Label htmlFor="mood">Based on Mood</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Movie Input */}
            {mode === 'movie' && (
              <div>
                <Label htmlFor="movie-name">Movie Name</Label>
                <Input
                  id="movie-name"
                  type="text"
                  placeholder="Enter a movie you like..."
                  value={movieName}
                  onChange={(e) => setMovieName(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}

            {/* Mood Selection */}
            {mode === 'mood' && (
              <div>
                <Label htmlFor="mood-select">Select Your Mood</Label>
                <Select value={selectedMood} onValueChange={setSelectedMood}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="How are you feeling?" />
                  </SelectTrigger>
                  <SelectContent>
                    {moods.map((mood) => (
                      <SelectItem key={mood.value} value={mood.value}>
                        {mood.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1"
              >
                <Heart className="w-4 h-4 mr-2" />
                {loading ? 'Finding Movies...' : 'Get Recommendations'}
              </Button>
              {onClose && (
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recommendations Results */}
      {recommendations.length > 0 && (
        <div className="mt-8">
          <MoviesGrid
            movies={recommendations}
            loading={false}
            title="Your Recommendations"
          />
        </div>
      )}
    </div>
  );
};
