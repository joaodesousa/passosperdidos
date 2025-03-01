// components/authors-panel.tsx
import { Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Author, GroupedAuthors } from "../../../../lib/types";
import { getPartyColor } from "../../../utils/colors";

interface AuthorsPanelProps {
  authors: Author[];
}

export function AuthorsPanel({ authors }: AuthorsPanelProps) {
  // Group authors by type
  const groupedAuthors: GroupedAuthors = authors.reduce((acc: GroupedAuthors, author) => {
    if (!acc[author.author_type]) {
      acc[author.author_type] = [];
    }
    acc[author.author_type].push(author);
    return acc;
  }, {});

  return (
    <Card className="dark:bg-[#09090B]">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Autores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(groupedAuthors).map(([authorType, authors], index, array) => (
            <div key={authorType}>
              <h3 className="font-semibold mb-2">{authorType}s:</h3>
              <div className="flex flex-wrap gap-2">
                {authors.map((author, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary"
                    className={author.party ? getPartyColor(author.party) : ""}
                  >
                    {author.name}
                  </Badge>
                ))}
              </div>
              {index < array.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}