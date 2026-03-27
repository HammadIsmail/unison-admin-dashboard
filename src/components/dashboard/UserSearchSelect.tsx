import { useState, useEffect, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, X } from "lucide-react";

export interface UserOption {
  id: string;
  username: string;
  name?: string;
}

interface UserSearchSelectProps {
  users: UserOption[];
  value: string;
  onChange: (userId: string, username: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export function UserSearchSelect({
  users,
  value,
  onChange,
  placeholder = "Search user...",
  loading = false,
}: UserSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === value),
    [users, value]
  );

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.name && u.name.toLowerCase().includes(q))
    );
  }, [users, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer",
          open && "ring-2 ring-ring ring-offset-2"
        )}
        onClick={() => setOpen(!open)}
      >
        <span className={cn(!selectedUser && "text-muted-foreground")}>
          {selectedUser ? selectedUser.username : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <X
              className="h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onChange("", "");
                setSearch("");
              }}
            />
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center border-b px-3 bg-popover rounded-t-lg">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground text-popover-foreground"
              placeholder="Search username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <ScrollArea className="max-h-[200px] min-h-[40px]">
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Loading users...</div>
            ) : filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {search ? "No results found" : "No users available"}
              </div>
            ) : (
              <div className="p-1">
                {filtered.map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      "flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm transition-colors",
                      "text-popover-foreground hover:bg-accent hover:text-accent-foreground",
                      value === user.id && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => {
                      onChange(user.id, user.username);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <span className="font-medium truncate">{user.username}</span>
                    {user.name && (
                      <span className="ml-2 text-muted-foreground text-xs truncate max-w-[120px]">
                        ({user.name})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
