<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()


definePageMeta({
  title: 'Политика обработки персональных данных',
  layout: 'empty',
  meta: [
    { name: 'description', content: 'Политика обработки персональных данных и использование файлов cookie на сайте клиники.' },
    { name: 'robots', content: 'index,follow' },
    { property: 'og:title', content: 'Политика обработки персональных данных' },
    { property: 'og:type', content: 'website' },
  ]
})


function goBack() {
  if (document.referrer && !document.referrer.includes('#form')) {
    window.history.back()
  } else {
    router.push('/') // fallback если реферер пустой или с #form
  }
}
</script>

<template>
  <main class="privacy">
    <div class="bg"></div>

    <div class="topbar">
      <button class="back" type="button" @click="goBack">← Назад</button>
    </div>

    <article class="card">
      <section id="general">
        <h2>1. Общие положения</h2>
        <p>
          ООО «Название вашей клиники» (далее — «Оператор») ставит соблюдение прав и свобод граждан одним из
          важнейших условий осуществления своей деятельности.
        </p>
        <p>
          Настоящая Политика применяется ко всей информации, которую Оператор может получить о посетителях
          веб‑сайта <strong>example.ru</strong>. Персональные данные обрабатываются в соответствии с ФЗ
          «О персональных данных» № 152‑ФЗ.
        </p>
      </section>

      <section id="terms">
        <h2>2. Основные понятия</h2>
        <ul>
          <li><strong>Веб‑сайт</strong> — ресурс, доступный по адресу <strong>example.ru</strong>.</li>
          <li><strong>Пользователь</strong> — любой посетитель веб‑сайта.</li>
          <li><strong>Персональные данные</strong> — сведения, относящиеся к Пользователю.</li>
          <li><strong>Обработка персональных данных</strong> — любое действие со сведениями (сбор, запись, хранение, уточнение, использование, удаление и пр.).</li>
          <li><strong>Файлы cookie</strong> — небольшие фрагменты данных, сохраняемые браузером для корректной работы сайта и повышения удобства использования.</li>
        </ul>
      </section>

      <section id="scope">
        <h2>3. Персональные данные, которые может обрабатывать Оператор</h2>
        <p>Мы обрабатываем только те данные, которые вы добровольно передаёте через формы на сайте:</p>
        <ul>
          <li>Имя;</li>
          <li>Номер телефона;</li>
          <li>Адрес электронной почты (если указывается);</li>
          <li>Текст сообщения/комментария в форме обратной связи;</li>
          <li>Обезличенные данные (в т. ч. cookie) через сервисы аналитики для статистики и улучшения работы сайта.</li>
        </ul>
      </section>

      <section id="purposes">
        <h2>4. Цели обработки персональных данных</h2>
        <ul>
          <li>Обратная связь по вашей заявке и консультации об услугах клиники;</li>
          <li>Исполнение обязательств по запросу Пользователя;</li>
          <li>Аналитика и улучшение качества работы сайта.</li>
        </ul>
      </section>

      <section id="legal">
        <h2>5. Правовые основания обработки</h2>
        <ul>
          <li>Отправка данных через формы на сайте означает ваше согласие с данной Политикой.</li>
          <li>Обработка cookie осуществляется, если это разрешено в настройках браузера Пользователя.</li>
        </ul>
      </section>

      <section id="security">
        <h2>6. Порядок обработки и защита данных</h2>
        <ul>
          <li>Оператор принимает необходимые и достаточные меры для защиты персональных данных от неправомерного доступа.</li>
          <li>Данные не передаются третьим лицам, за исключением случаев, предусмотренных законодательством.</li>
          <li>
            Пользователь может запросить актуализацию или удаление своих данных, отправив письмо на
            <a href="mailto:info@example.ru">info@example.ru</a>.
          </li>
          <li>Срок обработки персональных данных — до достижения целей обработки или до отзыва согласия Пользователем.</li>
        </ul>
      </section>

      <section id="final">
        <h2>7. Заключительные положения</h2>
        <ul>
          <li>Все вопросы по обработке персональных данных направляйте на <a href="mailto:info@example.ru">info@example.ru</a>.</li>
          <li>Оператор может вносить изменения в Политику; новая редакция вступает в силу с момента публикации на сайте.</li>
        </ul>
      </section>
    </article>
  </main>
</template>

<style scoped>
.privacy {
  position: relative;
  padding: 48px 16px 80px;
}

.bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(52vw 38vh at 50% 46%,
      rgba(7,128,150,.55) 0%,
      rgba(7,128,150,.35) 32%,
      rgba(7,128,150,.18) 50%,
      rgba(7,128,150,0) 72%
    ),
    radial-gradient(140% 100% at 50% -10%,
      rgba(10,14,22,0) 0%,
      rgba(10,14,22,.25) 40%,
      rgba(10,14,22,.60) 100%
    );
  background-repeat: no-repeat;
  background-attachment: fixed, scroll;
}

.topbar {
  max-width: 980px;
  margin: 0 auto 24px auto;
}

.back {
  background: none;
  border: none;
  color: #078096;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 0;
  transition: opacity .2s;
}
.back:hover {
  opacity: .7;
}

.card {
  max-width: 980px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0,0,0,.06);
  padding: clamp(16px, 2.5vw, 32px);
}

h2 {
  margin: 20px 0 12px;
  font-size: clamp(18px, 2.2vw, 24px);
  line-height: 1.3;
}

p, li {
  font-size: 16px;
  line-height: 1.7;
  color: #111827;
}

ul {
  padding-left: 18px;
  margin: 8px 0 16px;
}

a {
  color: #078096;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .card { border-radius: 12px; }
  .privacy { padding-top: 32px; }
}
</style>