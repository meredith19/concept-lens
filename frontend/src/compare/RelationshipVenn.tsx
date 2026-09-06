import { Fragment, type CSSProperties } from 'react'

import type { ComparisonResult } from '../api/types.ts'
import { type VennShape, vennShape } from './comparisonPresentation.ts'
import styles from './RelationshipVenn.module.css'

interface Region {
  label: string
  lines: string[]
  style: CSSProperties
}

interface Circle {
  label: string
  variant: 'variantA' | 'variantB'
  style: CSSProperties
  titleStyle: CSSProperties
  region?: Region
}

interface Overlap {
  label: string
  lines: string[]
  style: CSSProperties
}

interface Layout {
  circles: Circle[]
  overlap: Overlap
}

/**
 * Geometry for each relationship shape, in pixels against the fixed 700x370 canvas.
 * The values are taken from the UX mock; changing them changes the drawing.
 */
function layoutFor(
  shape: VennShape,
  a: { name: string },
  b: { name: string },
  shared: string[],
  onlyA: string[],
  onlyB: string[],
): Layout {
  switch (shape) {
    case 'OVERLAP':
      return {
        circles: [
          {
            label: a.name,
            variant: 'variantA',
            style: { left: 85, top: 20, width: 310, height: 310 },
            titleStyle: { left: 54, top: 42 },
            region: {
              label: `${a.name.toUpperCase()} ONLY`,
              lines: onlyA,
              style: { left: 22, top: 112, width: 150 },
            },
          },
          {
            label: b.name,
            variant: 'variantB',
            style: { left: 305, top: 20, width: 310, height: 310 },
            titleStyle: { right: 54, top: 42 },
            region: {
              label: `${b.name.toUpperCase()} ONLY`,
              lines: onlyB,
              style: { right: 22, top: 112, width: 150 },
            },
          },
        ],
        overlap: { label: 'SHARED', lines: shared, style: { left: 280, top: 118, width: 140 } },
      }

    case 'RIGHT_INSIDE_LEFT':
      // B's facts sit entirely inside A's, so the inner circle is all shared.
      return {
        circles: [
          {
            label: a.name,
            variant: 'variantA',
            style: { left: 155, top: 15, width: 390, height: 310 },
            titleStyle: { left: 58, top: 38 },
            region: {
              label: `${a.name.toUpperCase()} ONLY`,
              lines: onlyA,
              style: { left: 24, top: 126, width: 135 },
            },
          },
          {
            label: b.name,
            variant: 'variantB',
            style: { left: 315, top: 82, width: 190, height: 190 },
            titleStyle: { left: 42, top: 30 },
            region: { label: 'SHARED', lines: shared, style: { left: 20, top: 76, width: 150 } },
          },
        ],
        overlap: {
          label: `${b.name.toUpperCase()} ONLY`,
          lines: ['None'],
          style: { left: 285, top: 274, width: 178 },
        },
      }

    case 'LEFT_INSIDE_RIGHT':
      return {
        circles: [
          {
            label: b.name,
            variant: 'variantB',
            style: { left: 155, top: 15, width: 390, height: 310 },
            titleStyle: { right: 58, top: 38 },
            region: {
              label: `${b.name.toUpperCase()} ONLY`,
              lines: onlyB,
              style: { right: 24, top: 126, width: 135 },
            },
          },
          {
            label: a.name,
            variant: 'variantA',
            style: { left: 195, top: 82, width: 190, height: 190 },
            titleStyle: { left: 42, top: 30 },
            region: { label: 'SHARED', lines: shared, style: { left: 20, top: 76, width: 150 } },
          },
        ],
        overlap: {
          label: `${a.name.toUpperCase()} ONLY`,
          lines: ['None'],
          style: { left: 238, top: 274, width: 178 },
        },
      }

    case 'SAME_MEANING':
      // Both circles occupy the same space; the second is faded so the first stays readable.
      return {
        circles: [
          {
            label: a.name,
            variant: 'variantA',
            style: { left: 195, top: 20, width: 310, height: 310 },
            titleStyle: { left: 48, top: 42 },
          },
          {
            label: b.name,
            variant: 'variantB',
            style: {
              left: 195,
              top: 20,
              width: 310,
              height: 310,
              background: 'rgba(125, 143, 134, .06)',
            },
            titleStyle: { right: 48, bottom: 42 },
          },
        ],
        overlap: {
          label: '100% SHARED',
          lines: ['Same meanings'],
          style: { left: 270, top: 126, width: 160 },
        },
      }

    case 'DISJOINT':
      return {
        circles: [
          {
            label: a.name,
            variant: 'variantA',
            style: { left: 45, top: 20, width: 285, height: 285 },
            titleStyle: { left: 55, top: 42 },
            region: {
              label: `${a.name.toUpperCase()} ONLY`,
              lines: onlyA,
              style: { left: 35, top: 102, width: 190 },
            },
          },
          {
            label: b.name,
            variant: 'variantB',
            style: { left: 370, top: 20, width: 285, height: 285 },
            titleStyle: { right: 55, top: 42 },
            region: {
              label: `${b.name.toUpperCase()} ONLY`,
              lines: onlyB,
              style: { right: 35, top: 102, width: 190 },
            },
          },
        ],
        overlap: {
          label: 'SHARED',
          lines: ['None'],
          style: { left: 284, top: 276, width: 132 },
        },
      }
  }
}

function Lines({ values }: { values: string[] }) {
  return values.map((value, index) => (
    <Fragment key={value}>
      {index > 0 && <br />}
      {value}
    </Fragment>
  ))
}

interface RelationshipVennProps {
  result: ComparisonResult
}

export default function RelationshipVenn({ result }: RelationshipVennProps) {
  const { circles, overlap } = layoutFor(
    vennShape(result),
    result.leftConcept,
    result.rightConcept,
    result.matchedFacts.map((match) => match.leftFact.label),
    result.unmatchedLeftFacts.map((fact) => fact.label),
    result.unmatchedRightFacts.map((fact) => fact.label),
  )

  return (
    <div className={styles.frame}>
      <div className={styles.frameLabel}>RELATIONSHIP</div>
      <div className={styles.venn}>
        {circles.map((circle) => (
          <div
            key={circle.variant}
            className={`${styles.circle} ${styles[circle.variant]}`}
            style={circle.style}
          >
            <div className={styles.circleTitle} style={circle.titleStyle}>
              {circle.label}
            </div>
            {circle.region && circle.region.lines.length > 0 && (
              <div className={styles.only} style={circle.region.style}>
                <div className={styles.regionLabel}>{circle.region.label}</div>
                <div className={styles.regionValue}>
                  <Lines values={circle.region.lines} />
                </div>
              </div>
            )}
          </div>
        ))}

        <div className={styles.overlap} style={overlap.style}>
          <b>{overlap.label}</b>
          <strong>
            <Lines values={overlap.lines} />
          </strong>
        </div>
      </div>
    </div>
  )
}
