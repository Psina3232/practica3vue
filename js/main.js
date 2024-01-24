Vue.component('kanban-card', {
    props: ['card'],
    template: `
        <div class="card">
            <div class="card-title">{{ card.title }}</div>
            <div class="card-date">Created: {{ card.dateCreated }}</div>
            <div class="card-description">{{ card.description }}</div>
            <div class="card-deadline" v-if="card.deadline">Deadline: {{ card.deadline }}</div>
        </div>
    `
});

new Vue({
    el: '#app',
    data: {
        columns: [
            { name: 'Запланированные задачи', cards: [] },
            { name: 'Задачи в работе', cards: [] },
            { name: 'Тестирование', cards: [] },
            { name: 'Выполненные задачи', cards: [] }
        ],
        newCard: { title: '', description: '', deadline: '' }
    },
    methods: {
        addCard(columnIndex) {
            if (columnIndex === 0) {
                this.columns[columnIndex].cards.push({
                    title: this.newCard.title,
                    description: this.newCard.description,
                    deadline: this.newCard.deadline,
                    dateCreated: new Date().toLocaleString()
                });
                this.clearNewCard();
            }
        },
        clearNewCard() {
            this.newCard = { title: '', description: '', deadline: '' };
        }
    }
});
