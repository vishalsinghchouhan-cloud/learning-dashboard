export interface ParsedSubtopic {
  title: string;
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

// Helper: Count total nested subtopics to auto-estimate hours
function countSubtopics(subtopics: ParsedSubtopic[] = []): number {
  let count = subtopics.length;
  for (const sub of subtopics) {
    if (sub.subtopics && sub.subtopics.length > 0) {
      count += countSubtopics(sub.subtopics);
    }
  }
  return count;
}

// Helper: Assign Beginner / Intermediate / Advanced based on position in roadmap
function assignDifficulty(index: number, total: number): "Beginner" | "Intermediate" | "Advanced" {
  const ratio = index / Math.max(total, 1);
  if (ratio < 0.34) return "Beginner";
  if (ratio < 0.67) return "Intermediate";
  return "Advanced";
}

// Adapter 1: Parse roadmap.sh style JSON ({ nodes: [...], edges: [...] })
function parseRoadmapShFormat(raw: any, fallbackTitle: string): ParsedRoadmap {
  const nodes: any[] = raw.nodes || [];
  const edges: any[] = raw.edges || [];

  // Filter meaningful topic/subtopic nodes
  const validNodes = nodes.filter(
    (n) => n.data?.label && ["topic", "subtopic", "section", "title"].includes(n.type || "topic")
  );

  // Sort top-to-bottom by Y position so learning order is preserved
  validNodes.sort((a, b) => (a.position?.y || 0) - (b.position?.y || 0));

  const nodeMap = new Map<string, any>();
  validNodes.forEach((n) => nodeMap.set(n.id, n));

  // Build parent -> children adjacency list from edges
  const childrenMap = new Map<string, string[]>();
  const hasParent = new Set<string>();

  for (const edge of edges) {
    if (nodeMap.has(edge.source) && nodeMap.has(edge.target)) {
      const list = childrenMap.get(edge.source) || [];
      list.push(edge.target);
      childrenMap.set(edge.source, list);
      hasParent.add(edge.target);
    }
  }

  // Recursive builder for nested subtopics
  const buildSubtree = (nodeId: string, visited = new Set<string>()): ParsedSubtopic[] => {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);
    const childIds = childrenMap.get(nodeId) || [];
    return childIds
      .map((cid) => {
        const cNode = nodeMap.get(cid);
        if (!cNode) return null;
        return {
          title: String(cNode.data.label).trim(),
          isCompleted: false,
          subtopics: buildSubtree(cid, new Set(visited)),
        };
      })
      .filter(Boolean) as ParsedSubtopic[];
  };

  // Root topics are nodes with type 'topic' or nodes without parents
  const rootNodes = validNodes.filter((n) => n.type === "topic" || !hasParent.has(n.id));
  const selectedRoots = rootNodes.length > 0 ? rootNodes : validNodes;

  const topics: ParsedTopic[] = selectedRoots.map((node, idx) => {
    const subtopics = buildSubtree(node.id);
    const totalSubCount = countSubtopics(subtopics);
    return {
      title: String(node.data.label).trim(),
      difficulty: assignDifficulty(idx, selectedRoots.length),
      estimatedHours: Math.max(2, Math.round(totalSubCount * 1.5)),
      status: "Not Started",
      subtopics,
    };
  });

  return {
    title: raw.title || raw.name || fallbackTitle,
    description: raw.description || "Imported from roadmap JSON",
    topics,
  };
}

// Adapter 2: Recursive parser for any generic nested JSON tree
function parseGenericSubtopics(items: any[]): ParsedSubtopic[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item === "string") {
        return { title: item.trim(), isCompleted: false, subtopics: [] };
      }
      const title = item.title || item.name || item.label;
      if (!title) return null;
      const nested = item.subtopics || item.children || item.items || [];
      return {
        title: String(title).trim(),
        isCompleted: Boolean(item.isCompleted),
        subtopics: parseGenericSubtopics(nested),
      };
    })
    .filter(Boolean) as ParsedSubtopic[];
}

export function parseExternalRoadmapJSON(rawJson: any, fileName = "Imported Roadmap"): ParsedRoadmap {
  const cleanName = fileName.replace(/\.json$/i, "").replace(/[-_]/g, " ");

  // Detect roadmap.sh node/edge format
  if (Array.isArray(rawJson?.nodes)) {
    return parseRoadmapShFormat(rawJson, cleanName);
  }

  // Detect standard array or { topics: [...] } structure
  const rawTopics = Array.isArray(rawJson)
    ? rawJson
    : rawJson?.topics || rawJson?.modules || rawJson?.sections || [];

  const topics: ParsedTopic[] = rawTopics.map((t: any, idx: number) => {
    const title = typeof t === "string" ? t : t.title || t.name || t.label || `Topic ${idx + 1}`;
    const nestedRaw = t.subtopics || t.children || t.items || [];
    const subtopics = parseGenericSubtopics(nestedRaw);
    const totalSubCount = countSubtopics(subtopics);

    const validDifficulties = ["Beginner", "Intermediate", "Advanced"];
    const difficulty = validDifficulties.includes(t.difficulty)
      ? t.difficulty
      : assignDifficulty(idx, rawTopics.length);

    return {
      title: String(title).trim(),
      difficulty,
      estimatedHours: Number(t.estimatedHours) || Math.max(2, Math.round(totalSubCount * 1.5)),
      status: "Not Started",
      subtopics,
    };
  });

  return {
    title: rawJson?.title || rawJson?.trackName || rawJson?.name || cleanName,
    description: rawJson?.description || "",
    topics,
  };
}
