document.addEventListener('DOMContentLoaded', function () {
    const postSelect = document.getElementById('id_post');
    const commentSelect = document.getElementById('id_comment');

    postSelect.addEventListener('change', function () {
        const postId = this.value;

        if (!postId) {
            commentSelect.innerHTML = '<option value="" selected="selected">---------</option>';
            return;
        }

        fetch(`/admin/get-comments/?post_id=${postId}`)
            .then(response => response.json())
            .then(data => {
                let options = '<option value="" selected="selected">---------</option>';
                data.comments.forEach(comment => {
                    options += `<option value="${comment.id}">${comment.content}</option>`;
                });
                commentSelect.innerHTML = options;
            })
            .catch(error => {
                console.error('Error fetching comments:', error);
            });
    });
});
