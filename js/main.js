// Определение Vue-компонента 'kanban-card'
Vue.component('kanban-card', {
  // Определение входных параметров (props) компонента
  props: ['card', 'columnIndex', 'cardIndex'],
  // HTML-шаблон компонента с использованием условных классов
  template: `
    <div :class="{
      'card': true,
      'completed-on-time': card.status === 'Completed on time',
      'overdue': card.status === 'Overdue',
      'readonly': columnIndex === 3
    }">
      <div class="card-title">{{ card.title }}</div>
      <div class="card-date">Создано: {{ card.dateCreated }}</div>
      <div class="card-date">Последнее редактирование: {{ card.lastEdited }}</div>
      <div class="card-description">{{ card.description }}</div>
      <div class="card-deadline" v-if="card.deadline">Дедлайн: {{ card.deadline }}</div>
      <div class="card-status" v-if="card.status">Статус: 
        {{ columnIndex === 3 && card.status === 'Completed on time' ? 'Выполнено' : '' }}
        {{ columnIndex === 3 && card.status === 'Overdue' ? 'Просрочено' : '' }}
        {{ columnIndex !== 3 ? card.status : '' }}
      </div>
      <div class="card-actions">
        <button v-if="columnIndex !== 3" @click="editCard">Редактировать</button>
        <button v-if="columnIndex !== 1 && columnIndex !== 2 && columnIndex !== 3" @click="deleteCard">Удалить</button>
        <button v-if="columnIndex === 0" @click="moveToInProgress">Дальше</button>
        <button v-if="columnIndex === 1" @click="moveToTesting">Дальше</button>
        <button v-if="columnIndex === 2" @click="moveToDone">Дальше</button>
        <button v-if="columnIndex === 2" @click="returnToInProgressWithReason">Назад</button>
      </div>
    </div>
  `,
  // Определение методов компонента
  methods: {
      // Метод для редактирования карточки
      editCard() {
          const updatedTitle = prompt('Редактировать заголовок', this.card.title);
          const updatedDescription = prompt('Редактировать описание', this.card.description);
          const updatedDeadline = prompt('Редактировать дедлайн', this.card.deadline);

          // Обновление данных карточки при условии, что пользователь не отменил ввод
          if (updatedTitle !== null && updatedDescription !== null && updatedDeadline !== null) {
              this.card.title = updatedTitle;
              this.card.description = updatedDescription;
              this.card.deadline = updatedDeadline;
              this.card.lastEdited = new Date().toLocaleString();
          }
      },
      // Метод для удаления карточки с использованием события $emit
      deleteCard() {
          this.$emit('delete-card', this.columnIndex, this.cardIndex);
      },
      // Методы для перемещения карточки в различные столбцы с использованием события $emit
      moveToInProgress() {
          this.$emit('move-to-in-progress', this.card, this.columnIndex, this.cardIndex);
      },
      moveToTesting() {
          this.$emit('move-to-testing', this.card, this.columnIndex, this.cardIndex);
      },
      moveToDone() {
          this.$emit('move-to-done', this.card, this.columnIndex, this.cardIndex);
      },
      // Метод для возврата карточки в столбец "В работе" с указанием причины
      returnToInProgressWithReason() {
          const inProgressIndex = 1;
          let returnReason = '';

          // Запрос причины возврата у пользователя
          while (returnReason === '' || returnReason === null) {
              returnReason = prompt('Укажите причину возврата карточки:');

              // Обработка случая, когда пользователь отменил ввод
              if (returnReason === null) {
                  return;
              }

              // Предупреждение, если пользователь не указал причину возврата
              if (returnReason === '') {
                  alert('Пожалуйста, укажите причину возврата.');
              }
          }

          // Создание копии исходной карточки и добавление новой карточки в столбец "В работе"
          const originalCardCopy = { ...this.card };
          this.$parent.columns[inProgressIndex].cards.push({
              title: originalCardCopy.title,
              description: originalCardCopy.description,
              deadline: originalCardCopy.deadline,
              dateCreated: originalCardCopy.dateCreated,
              lastEdited: originalCardCopy.lastEdited,
              returnReason: returnReason
          });

          // Удаление оригинальной карточки из текущего столбца
          this.$parent.columns[this.columnIndex].cards.splice(this.cardIndex, 1);
      }
  }
});

// Создание корневого экземпляра Vue
new Vue({
  // Привязка Vue-экземпляра к элементу с id "app"
  el: '#app',
  // Определение данных для экземпляра Vue
  data: {
      columns: [
          { name: 'Запланированные задачи', cards: [] },
          { name: 'Задачи в работе', cards: [] },
          { name: 'Тестирование', cards: [] },
          { name: 'Выполненные задачи', cards: [] }
      ],
      newCard: { title: '', description: '', deadline: '' }
  },
  // Определение вычисляемого свойства для проверки валидности формы
  computed: {
      isFormValid() {
          return this.newCard.title && this.newCard.description && this.newCard.deadline;
      }
  },
  // Определение методов для экземпляра Vue
  methods: {
      // Метод для добавления новой карточки в указанный столбец
      addCard(columnIndex) {
          if (columnIndex === 0 && this.isFormValid) {
              const newCard = {
                  title: this.newCard.title,
                  description: this.newCard.description,
                  deadline: this.newCard.deadline,
                  dateCreated: new Date().toLocaleString(),
                  lastEdited: new Date().toLocaleString()
              };
              this.columns[columnIndex].cards.push(newCard);
              this.clearNewCard();
          }
      },
      // Метод для очистки формы новой карточки
      clearNewCard() {
          this.newCard = { title: '', description: '', deadline: '' };
      },
      // Метод для удаления карточки с использованием подтверждения пользователя
      deleteCard(columnIndex, cardIndex) {
          const confirmation = confirm('Вы действительно хотите удалить карту?');
          if (confirmation) {
              this.columns[columnIndex].cards.splice(cardIndex, 1);
          }
      },
      // Методы для перемещения карточек между столбцами
      moveToInProgress(originalCard, columnIndex, cardIndex) {
          const inProgressIndex = 1;
          this.columns[inProgressIndex].cards.push({
              title: originalCard.title,
              description: originalCard.description,
              deadline: originalCard.deadline,
              dateCreated: originalCard.dateCreated,
              lastEdited: originalCard.lastEdited
          });
          this.columns[columnIndex].cards.splice(cardIndex, 1);
      },
      moveToTesting(originalCard, columnIndex, cardIndex) {
          const testingIndex = 2;
          this.columns[testingIndex].cards.push({
              title: originalCard.title,
              description: originalCard.description,
              deadline: originalCard.deadline,
              dateCreated: originalCard.dateCreated,
              lastEdited: originalCard.lastEdited
          });
          this.columns[columnIndex].cards.splice(cardIndex, 1);
      },
      moveToDone(originalCard, columnIndex, cardIndex) {
          const doneIndex = 3;
          const deadline = new Date(originalCard.deadline);
          const currentDate = new Date();

          // Установка статуса в зависимости от дедлайна
          if (currentDate > deadline) {
              originalCard.status = 'Overdue';
          } else {
              originalCard.status = 'Completed on time';
          }

          // Добавление карточки в столбец "Выполненные задачи"
          this.columns[doneIndex].cards.push({
              title: originalCard.title,
              description: originalCard.description,
              deadline: originalCard.deadline,
              dateCreated: originalCard.dateCreated,
              lastEdited: originalCard.lastEdited,
              status: originalCard.status
          });

          // Удаление карточки из текущего столбца
          this.columns[columnIndex].cards.splice(cardIndex, 1);
      },
      // Метод для возврата карточки в столбец "В работе"
      returnToInProgress(originalCard, columnIndex, cardIndex) {
          const inProgressIndex = 1;

          // Поиск существующей карточки в столбце "В работе"
          const existingInProgressCardIndex = this.columns[inProgressIndex].cards.findIndex(card => card.title === originalCard.title);

          if (existingInProgressCardIndex === -1) {
              // Карточка еще не существует во втором столбце, добавим ее
              const updatedCard = {
                  title: originalCard.title,
                  description: originalCard.description,
                  deadline: originalCard.deadline,
                  dateCreated: originalCard.dateCreated,
                  lastEdited: originalCard.lastEdited
              };

              this.columns[inProgressIndex].cards.push(updatedCard);
          } else {
              // Карточка уже существует во втором столбце, обновим данные
              const existingInProgressCard = this.columns[inProgressIndex].cards[existingInProgressCardIndex];
              existingInProgressCard.description = originalCard.description;
              existingInProgressCard.deadline = originalCard.deadline;
          }

          // Копирование объекта, чтобы сохранить lastEdited в старом объекте
          const originalCardCopy = Object.assign({}, originalCard);

          // Установка lastEdited в оригинальной карточке обратно
          Vue.set(this.columns[columnIndex].cards[cardIndex], 'lastEdited', originalCardCopy.lastEdited);

          // Удаление карточки из текущего столбца
          this.columns[columnIndex].cards.splice(cardIndex, 1);
      },
      // Редактирование карточки.
      editCard() {
          const updatedTitle = prompt('Редактировать заголовок', this.card.title);
          const updatedDescription = prompt('Редактировать описание', this.card.description);
          const updatedDeadline = prompt('Редактировать дедлайн', this.card.deadline);

          if (updatedTitle !== null && updatedDescription !== null && updatedDeadline !== null) {
              this.card.title = updatedTitle;
              this.card.description = updatedDescription;
              this.card.deadline = updatedDeadline;
              this.card.lastEdited = new Date().toLocaleString();
          }
      }
  }
});
