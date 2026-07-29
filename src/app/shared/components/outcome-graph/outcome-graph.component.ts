import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningOutcome } from '../../models/learning-outcome.model';

interface GraphNode {
  outcome: LearningOutcome;
  x: number;
  y: number;
}

interface GraphEdge {
  fromId: string;
  toId: string;
  path: string;
  isCycle: boolean;
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 56;
const H_GAP = 40;
const V_GAP = 90;

/**
 * Kazanım ve önkoşul ilişkilerini düğüm-kenar (node-link) grafiği olarak
 * çizer. Seviyeye göre katmanlar halinde yerleşir, döngüleri (varsa)
 * kırmızı kesikli kenarla işaretler ve bir düğüme tıklandığında
 * odak (focus) modunda yalnızca doğrudan komşularını vurgular.
 */
@Component({
  selector: 'app-outcome-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './outcome-graph.component.html',
  styleUrl: './outcome-graph.component.scss',
})
export class OutcomeGraphComponent {
  @Input({ required: true }) set outcomes(value: LearningOutcome[]) {
    this._outcomes.set(value ?? []);
  }
  get outcomes(): LearningOutcome[] {
    return this._outcomes();
  }

  /** Bir düğüme tıklandığında/odaklanıldığında dışarıya haber verir. */
  @Output() outcomeSelected = new EventEmitter<LearningOutcome>();

  private readonly _outcomes = signal<LearningOutcome[]>([]);
  readonly focusedId = signal<string | null>(null);

  private readonly nodesById = computed(() => {
    const byLevel = new Map<number, LearningOutcome[]>();
    for (const outcome of this._outcomes()) {
      const list = byLevel.get(outcome.level) ?? [];
      list.push(outcome);
      byLevel.set(outcome.level, list);
    }

    const levels = [...byLevel.keys()].sort((a, b) => a - b);
    const nodes = new Map<string, GraphNode>();

    levels.forEach((level, levelIndex) => {
      const outcomesAtLevel = byLevel.get(level)!;
      outcomesAtLevel.forEach((outcome, indexInLevel) => {
        nodes.set(outcome.id, {
          outcome,
          x: indexInLevel * (NODE_WIDTH + H_GAP) + H_GAP,
          y: levelIndex * (NODE_HEIGHT + V_GAP) + V_GAP,
        });
      });
    });

    return nodes;
  });

  readonly nodes = computed(() => [...this.nodesById().values()]);

  readonly svgWidth = computed(() => {
    const nodes = this.nodes();
    if (nodes.length === 0) return 400;
    const maxX = Math.max(...nodes.map((n) => n.x));
    return maxX + NODE_WIDTH + H_GAP;
  });

  readonly svgHeight = computed(() => {
    const nodes = this.nodes();
    if (nodes.length === 0) return 200;
    const maxY = Math.max(...nodes.map((n) => n.y));
    return maxY + NODE_HEIGHT + V_GAP;
  });

  /**
   * DFS ile geriye dönük kenar (back-edge) arar; bulunan her geri kenar
   * önkoşul grafiğinde bir döngünün parçasıdır.
   */
  readonly edges = computed<GraphEdge[]>(() => {
    const nodes = this.nodesById();
    const outcomes = this._outcomes();
    const byId = new Map(outcomes.map((o) => [o.id, o]));

    const cycleEdgeKeys = new Set<string>();
    const visited = new Set<string>();
    const inStack = new Set<string>();

    const visit = (id: string): void => {
      if (inStack.has(id) || visited.has(id)) {
        return;
      }
      visited.add(id);
      inStack.add(id);

      const outcome = byId.get(id);
      if (outcome) {
        for (const prereqId of outcome.prerequisiteIds) {
          if (inStack.has(prereqId)) {
            cycleEdgeKeys.add(`${prereqId}->${id}`);
          } else if (byId.has(prereqId)) {
            visit(prereqId);
          }
        }
      }

      inStack.delete(id);
    };

    for (const outcome of outcomes) {
      visit(outcome.id);
    }

    const edges: GraphEdge[] = [];
    for (const outcome of outcomes) {
      for (const prereqId of outcome.prerequisiteIds) {
        const from = nodes.get(prereqId);
        const to = nodes.get(outcome.id);
        if (!from || !to) {
          continue;
        }

        const fromX = from.x + NODE_WIDTH / 2;
        const fromY = from.y + NODE_HEIGHT;
        const toX = to.x + NODE_WIDTH / 2;
        const toY = to.y;
        const midY = (fromY + toY) / 2;

        edges.push({
          fromId: prereqId,
          toId: outcome.id,
          path: `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`,
          isCycle: cycleEdgeKeys.has(`${prereqId}->${outcome.id}`),
        });
      }
    }

    return edges;
  });

  readonly hasCycle = computed(() => this.edges().some((edge) => edge.isCycle));

  /** Odak modunda: seçili düğüm ve doğrudan komşuları dışında her şey soluklaşır. */
  isDimmed(id: string): boolean {
    const focused = this.focusedId();
    if (!focused || focused === id) {
      return false;
    }

    const outcome = this.nodesById().get(id)?.outcome;
    const focusedOutcome = this.nodesById().get(focused)?.outcome;
    if (!outcome || !focusedOutcome) {
      return true;
    }

    const isPrerequisiteOfFocused = focusedOutcome.prerequisiteIds.includes(id);
    const dependsOnFocused = outcome.prerequisiteIds.includes(focused);

    return !isPrerequisiteOfFocused && !dependsOnFocused;
  }

  isEdgeDimmed(edge: GraphEdge): boolean {
    const focused = this.focusedId();
    if (!focused) {
      return false;
    }
    return edge.fromId !== focused && edge.toId !== focused;
  }

  toggleFocus(outcome: LearningOutcome): void {
    this.focusedId.set(this.focusedId() === outcome.id ? null : outcome.id);
    this.outcomeSelected.emit(outcome);
  }

  clearFocus(): void {
    this.focusedId.set(null);
  }
}