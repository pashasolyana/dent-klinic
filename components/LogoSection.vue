<template>
  <section class="logo-marquee" :aria-label="ariaLabel" :style="cssVars">
    <h2 v-if="resolvedShowTitle" class="logo-marquee__title">
      {{ resolvedTitle }}
    </h2>

    <div
      class="logo-marquee__viewport"
      ref="viewport"
      :style="{ '--logo-height': logoHeight + 'px' }"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <div
        class="logo-marquee__track"
        ref="track"
        :style="cssVars"
        :class="{ 'is-paused': pauseOnHover && hovering }"
      >
        <component
          v-for="(item, idx) in repeatedItems"
          :is="item.href ? 'a' : 'div'"
          :href="item.href || undefined"
          class="logo-marquee__item"
          :key="idx"
          :title="item.alt || undefined"
          target="_blank"
          rel="noopener"
        >
          <img
            :src="item.src"
            :alt="item.alt || 'Логотип'"
            class="logo-marquee__img"
            loading="lazy"
            decoding="async"
          />
        </component>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch, withDefaults, defineProps } from 'vue';

interface LogoItem {
  src: string;
  alt?: string;
  href?: string;
}

const props = withDefaults(defineProps<{
  items: LogoItem[];
  title?: string;
  ariaLabel?: string;
  logoHeight?: number; // px
  gap?: number;        // px
  speed?: number;      // px/s
  pauseOnHover?: boolean;
  showTitle?: boolean;
  titleSize?: number | string; 
}>(), {
  title: 'Производители',
  ariaLabel: 'Логотипы производителей',
  logoHeight: 120,
  gap: 48,
  speed: 80,
  pauseOnHover: true,
  showTitle: true,
    titleSize: 36, 
});

const viewport = ref<HTMLElement | null>(null);
const track = ref<HTMLElement | null>(null);
const hovering = ref(false);

const logoHeight = computed(() => props.logoHeight);
const gap = computed(() => props.gap);
const speed = computed(() => props.speed);
const pauseOnHover = computed(() => props.pauseOnHover);

// если случайно передали title="" — подставим дефолт
const resolvedTitle = computed(() => (props.title && props.title.trim().length ? props.title : 'Производители'));
const resolvedShowTitle = computed(() => props.showTitle !== false);

const repeatedItems = computed(() => [...props.items, ...props.items]);

const duration = ref(30);
let resizeObserver: ResizeObserver | null = null;

const recompute = () => {
  if (!track.value) return;
  const oneListWidth = track.value.scrollWidth / 2;
  duration.value = Math.max(6, oneListWidth / speed.value);
};

onMounted(() => {
  recompute();
  resizeObserver = new ResizeObserver(recompute);
  if (track.value) resizeObserver.observe(track.value);
  if (viewport.value) resizeObserver.observe(viewport.value);
});
onBeforeUnmount(() => { if (resizeObserver) resizeObserver.disconnect(); });

watch(() => [props.items, gap.value, speed.value, logoHeight.value], () => {
  queueMicrotask(recompute);
});

const cssVars = computed(() => ({
  '--gap': `${gap.value}px`,
  '--duration': `${duration.value}s`,
  '--logo-height': `${logoHeight.value}px`,
  '--title-size':
    typeof props.titleSize === 'number'
      ? `${props.titleSize}px`
      : (props.titleSize || '36px'),     // 👈 НОВОЕ
}) as Record<string, string>);
</script>

<style scoped>
.logo-marquee {
  position: relative;
  z-index: 5;
  padding-block: 32px 16px;
}

.logo-marquee__title {
  position: relative;
  z-index: 6;
  text-align: center;
  font-weight: 700;
  color: #fff;
  margin: 0 0 32px;
  font-size: var(--title-size, 36px);
  line-height: 1.2;
}

.logo-marquee__viewport {
  --fade-size: 56px;
  position: relative;
  overflow: hidden;
  padding-block: 16px;
  min-height: calc(var(--logo-height, 120px) + 56px);

  mask-image: linear-gradient(
    to right, transparent,
    black var(--fade-size),
    black calc(100% - var(--fade-size)),
    transparent
  );
  -webkit-mask-image: linear-gradient(
    to right, transparent,
    black var(--fade-size),
    black calc(100% - var(--fade-size)),
    transparent
  );
}

.logo-marquee__track {
  display: inline-flex;
  align-items: center;
  gap: var(--gap, 48px);
  padding-inline: var(--gap, 48px);
  will-change: transform;
  animation: marquee var(--duration, 30s) linear infinite;
}
.logo-marquee__track.is-paused {
  animation-play-state: paused;
}

.logo-marquee__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  opacity: 0.96;
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.logo-marquee__item:hover {
  transform: translateY(-2px) scale(1.02);
  opacity: 1;
}

.logo-marquee__img {
  height: var(--logo-height, 120px);
  width: auto;
  object-fit: contain;
  display: block;
  pointer-events: none;
}

/* ---------- MOBILE ---------- */
@media (max-width: 599px) {
  .logo-marquee {
    padding-block: 24px 12px;
  }

  .logo-marquee__title {
    font-size: calc(var(--title-size, 36px) * 0.8);
    margin-bottom: 24px;
  }

  .logo-marquee__viewport {
    --fade-size: 24px;
    min-height: calc(var(--logo-height, 120px) * 0.7 + 24px);
    padding-block: 8px;
  }

  .logo-marquee__track {
    gap: calc(var(--gap, 48px) * 0.6);
    padding-inline: calc(var(--gap, 48px) * 0.6);
  }

  .logo-marquee__img {
    height: calc(var(--logo-height, 120px) * 0.7);
  }
}

/* ---------- TABLETS ---------- */
@media (min-width: 600px) and (max-width: 899px) {
  .logo-marquee {
    padding-block: 28px 14px;
  }

  .logo-marquee__title {
    font-size: calc(var(--title-size, 36px) * 0.9);
    margin-bottom: 28px;
  }

  .logo-marquee__viewport {
    --fade-size: 40px;
    min-height: calc(var(--logo-height, 120px) * 0.85 + 28px);
    padding-block: 12px;
  }

  .logo-marquee__track {
    gap: calc(var(--gap, 48px) * 0.75);
    padding-inline: calc(var(--gap, 48px) * 0.75);
  }

  .logo-marquee__img {
    height: calc(var(--logo-height, 120px) * 0.85);
  }
}

/* ---------- REDUCED MOTION ---------- */
@media (prefers-reduced-motion: reduce) {
  .logo-marquee__track {
    animation: none;
    justify-content: center;
    flex-wrap: wrap;
  }

  .logo-marquee__item {
    margin: 8px 16px;
  }
}

/* ---------- ANIMATION ---------- */
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

</style>

