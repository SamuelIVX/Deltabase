"use client";
/**
 * Dashboard right rail — Bloomberg-style Market Intelligence news wire.
 */
import React from "react";
import styles from "./rightbar.module.css";
import useFinnhubNews from "@/hooks/useFinnhubNews";
import type { MarketNewsArticle } from "@/types/news";
import { Badge } from "@/components/ui/Badge";

export type { MarketNewsArticle as NewsItem };

/**
 * Formats a unix timestamp (in seconds) to relative time (e.g. "15m ago", "2h ago").
 * @param seconds - Unix epoch seconds.
 * @returns Human-readable relative time string.
 */
export function formatRelativeTime(seconds: number): string {
  if (!seconds || !Number.isFinite(seconds)) return "";
  const nowSec = Math.floor(Date.now() / 1000);
  const diffSec = Math.max(0, nowSec - seconds);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Institutional market intelligence feed displaying top financial headlines.
 * @returns {JSX.Element} Right rail news panel.
 */
const Rightbar = () => {
  const { data, isPending, isError } = useFinnhubNews();
  const rawArticles = (Array.isArray(data) ? data : []) as MarketNewsArticle[];
  const articles = rawArticles.slice(0, 5);

  return (
    <aside className={styles.container} aria-label="Market News">
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Market News</h2>
          <Badge variant="accent" className={styles.liveBadge}>Live Wire</Badge>
        </div>

        {isPending && (
          <div className={styles.loadingState} role="status">
            <span>Loading headlines...</span>
          </div>
        )}

        {isError && (
          <p className={styles.emptyState}>
            Market news feed temporarily unavailable.
          </p>
        )}

        {!isPending && !isError && articles.length === 0 && (
          <p className={styles.emptyState}>No recent market headlines.</p>
        )}

        {!isPending && !isError && articles.length > 0 && (
          <ul className={styles.articleList}>
            {articles.map((article) => {
              const formattedTime = formatRelativeTime(article.datetime);
              return (
                <li key={article.id} className={styles.articleItem}>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.articleLink}
                  >
                    <div className={styles.articleBody}>
                      <div className={styles.metaRow}>
                        <span className={styles.source}>
                          {article.source || "News"}
                        </span>
                        {formattedTime && (
                          <span className={styles.time}>{formattedTime}</span>
                        )}
                      </div>
                      <h3 className={styles.headline}>{article.headline}</h3>
                    </div>
                    {article.image && article.image.trim() !== "" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.image}
                        alt=""
                        aria-hidden="true"
                        className={styles.thumbnail}
                        loading="lazy"
                      />
                    ) : null}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default Rightbar;
