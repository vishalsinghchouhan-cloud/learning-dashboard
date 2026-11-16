export interface ParsedSubtopic {
  title: string;
  estimatedHours: number;
  isCompleted: boolean;
  subtopics?: ParsedSubtopic[];
}

export interface ParsedTopic {
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  status: "Not Started";
  subtopics: ParsedSubtopic[];
}

export interface ParsedRoadmap {
  title: string;
  description?: string;
  topics: ParsedTopic[];
}

const VALID_DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

// Helper: Extract title from any common field name (supports both item.title and item.data.label)
function extractTitle(item: any): string | null {
  if (typeof item === "string") return item.trim() || null;
  if (!item || typeof item !== "object") return null;

  const raw =
    item.title ??
    item.name ??
    item.label ??
    item.topic ??
    item.heading ??
    item.data?.label ??
    item.data?.title ??
    item.data?.name;

  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

// Helper: Extract nested children array from any common key name
function extractChildren(item: any): any[] {
  if (!item || typeof item !== "object") return [];
  const candidate =
    item.subtopics ??
    item.children ??
    item.items ??
    item.nodes ??
    item.tasks ??
    item.modules ??
    item.lessons;
  return Array.isArray(candidate) ? candidate : [];
}

function sumSubtopicHours(subtopics: ParsedSubtopic[] = []): number {
  let total = 0;
  for (const sub of subtopics) {
    total += sub.estimatedHours || 1;
    if (sub.subtopics && sub.subtopics.length > 0) {
      total += sumSubtopicHours(sub.subtopics);
    }
  }
  return total;
}

function assignDifficulty(index: number, total: number): "Beginner" | "Intermediate" | "Advanced" {
  const ratio = index / Math.max(total, 1);
  if (ratio < 0.34) return "Beginner";
  if (ratio < 0.67) return "Intermediate";
  return "Advanced";
}

// Adapter 1: Graph format with { nodes: [...], edges: [...] }
function parseGraphFormat(raw: any, fallbackTitle: string): ParsedRoadmap {
  const nodes: any[] = raw.nodes || [];
  const edges: any[] = raw.edges || [];

  const validNodes = nodes.filter((n) => {
    const hasTitle = Boolean(extractTitle(n));
    const allowedType = !n.type || ["topic", "subtopic", "section", "title", "node"].includes(n.type);
    return hasTitle && allowedType;
  });

  validNodes.sort((a, b) => (a.position?.y || 0) - (b.position?.y || 0));

  const nodeMap = new Map<string, any>();
  validNodes.forEach((n, idx) => nodeMap.set(String(n.id ?? idx), n));

  const childrenMap = new Map<string, string[]>();
  const hasParent = new Set<string>();

  for (const edge of edges) {
    const src = String(edge.source);
    const tgt = String(edge.target);
    if (nodeMap.has(src) && nodeMap.has(tgt)) {
      const list = childrenMap.get(src) || [];
      list.push(tgt);
      childrenMap.set(src, list);
      hasParent.add(tgt);
    }
  }

  const buildSubtree = (nodeId: string, visited = new Set<string>()): ParsedSubtopic[] => {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);
    const childIds = childrenMap.get(nodeId) || [];
    return childIds
      .map((cid) => {
        const cNode = nodeMap.get(cid);
        if (!cNode) return null;
        const nestedFromEdges = buildSubtree(cid, new Set(visited));
        const nestedFromProps = parseGenericSubtopics(extractChildren(cNode));
        const nested = [...nestedFromEdges, ...nestedFromProps];
        const nestedHrs = sumSubtopicHours(nested);

        return {
          title: extractTitle(cNode)!,
          estimatedHours: Number(cNode.estimatedHours) || (nestedHrs > 0 ? nestedHrs : 1.5),
          isCompleted: Boolean(cNode.isCompleted),
          subtopics: nested,
        };
      })
      .filter(Boolean) as ParsedSubtopic[];
  };

  const rootEntries = Array.from(nodeMap.entries()).filter(
    ([id, n]) => n.type === "topic" || !hasParent.has(id)
  );
  const selectedRoots = rootEntries.length > 0 ? rootEntries : Array.from(nodeMap.entries());

  const topics: ParsedTopic[] = selectedRoots.map(([id, node], idx) => {
    const edgeSubs = buildSubtree(id);
    const propSubs = parseGenericSubtopics(extractChildren(node));
    const subtopics = [...edgeSubs, ...propSubs];
    const totalSubHours = sumSubtopicHours(subtopics);

    const difficulty = VALID_DIFFICULTIES.includes(node.difficulty)
      ? node.difficulty
      : assignDifficulty(idx, selectedRoots.length);

    return {
      title: extractTitle(node)!,
      difficulty,
      estimatedHours: Number(node.estimatedHours) || Math.max(2, Math.round(totalSubHours)),
      status: "Not Started",
      subtopics,
    };
  });

  return {
    title: extractTitle(raw) || fallbackTitle,
    description: typeof raw.description === "string" ? raw.description : "Imported from roadmap JSON",
    topics,
  };
}

// Adapter 2: Recursive parser for any generic nested JSON tree
function parseGenericSubtopics(items: any[]): ParsedSubtopic[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      const title = extractTitle(item);
      if (!title) return null;
      const nested = parseGenericSubtopics(extractChildren(item));
      const nestedHrs = sumSubtopicHours(nested);
      return {
        title,
        estimatedHours: Number(item?.estimatedHours) || (nestedHrs > 0 ? nestedHrs : 1),
        isCompleted: Boolean(item?.isCompleted),
        subtopics: nested,
      };
    })
    .filter(Boolean) as ParsedSubtopic[];
}

// Fallback: Find the first meaningful array inside any custom JSON object
function findBestTopicArray(rawJson: any): any[] {
  if (Array.isArray(rawJson)) return rawJson;
  if (!rawJson || typeof rawJson !== "object") return [];

  const preferredKeys = [
    "topics",
    "modules",
    "sections",
    "chapters",
    "steps",
    "curriculum",
    "courses",
    "items",
    "skills",
    "nodes",
  ];

  for (const key of preferredKeys) {
    if (Array.isArray(rawJson[key]) && rawJson[key].length > 0) {
      return rawJson[key];
    }
  }

  // Deep fallback: pick the largest array in the root object that contains valid titles
  let bestArray: any[] = [];
  for (const value of Object.values(rawJson)) {
    if (Array.isArray(value) && value.length > bestArray.length) {
      const hasTitles = value.some((el) => Boolean(extractTitle(el)));
      if (hasTitles) bestArray = value;
    }
  }
  return bestArray;
}

export function parseExternalRoadmapJSON(rawJson: any, fileName = "Imported Roadmap"): ParsedRoadmap {
  const cleanName = fileName.replace(/\.json$/i, "").replace(/[-_]/g, " ");

  // Use graph parser if both nodes and edges exist, or if nodes use roadmap.sh data.label
  if (Array.isArray(rawJson?.nodes) && rawJson.nodes.length > 0) {
    return parseGraphFormat(rawJson, cleanName);
  }

  const rawTopics = findBestTopicArray(rawJson);

  const topics: ParsedTopic[] = rawTopics
    .map((t: any, idx: number) => {
      const title = extractTitle(t);
      if (!title) return null;

      const subtopics = parseGenericSubtopics(extractChildren(t));
      const totalSubHours = sumSubtopicHours(subtopics);

      const difficulty = VALID_DIFFICULTIES.includes(t?.difficulty)
        ? t.difficulty
        : assignDifficulty(idx, rawTopics.length);

      return {
        title,
        difficulty,
        estimatedHours: Number(t?.estimatedHours) || Math.max(2, Math.round(totalSubHours)),
        status: "Not Started",
        subtopics,
      };
    })
    .filter(Boolean) as ParsedTopic[];

  return {
    title: rawJson?.title || rawJson?.trackName || rawJson?.name || cleanName,
    description: typeof rawJson?.description === "string" ? rawJson.description : "",
    topics,
  };
}
